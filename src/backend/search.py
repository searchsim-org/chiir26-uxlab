import json
import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, UUID4
from tavily import TavilyClient
import redis
import requests

from schemas import SearchResponse, SearchResult

from chatnoir_api.v1 import search as chatnoir_search, search_phrases, search
from chatnoir_api import cache_contents, Index

# Constants for ChatNoir API
CHATNOIR_API_URL = "https://chatnoir.web.webis.de/api/v1"
CHATNOIR_API_KEY = os.getenv("CHATNOIR_API_KEY")

load_dotenv()
router = APIRouter()

redis_url = os.getenv("REDIS_URL")
redis_client = redis.Redis.from_url(redis_url) if redis_url else None
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def search_tavily(query: str) -> SearchResponse:
    try:
        cache_key = f"search:{query}"
        cached_results = None

        if redis_client:
            cached_results = redis_client.get(cache_key)

        if not cached_results:
            response = tavily.search(
                query=query,
                search_depth="basic",
                max_results=10,
                include_images=True,
            )  # type: ignore
            if redis_client:
                redis_client.set(cache_key, json.dumps(response), ex=7200)
        else:
            response = json.loads(cached_results)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="There was an error while searching. Please try again.",
        )
    results = [
        SearchResult(
            title=result["title"],
            url=result["url"],
            content=result["content"],
        )
        for result in response["results"]
    ]
    return SearchResponse(results=results, images=response["images"])



def search_chatnoir_simple(query: str, size: int = 10) -> SearchResponse:
    api_key = os.getenv("CHATNOIR_API_KEY")
    # results = chatnoir_search(api_key, query, index=Index.ClueWeb22, size=size)
    results = search(api_key, query, staging=True, index=Index.ClueWeb22)
    
    search_results = [
        SearchResult(
            title=result.title,
            url=result.target_uri,
            content=result.snippet,
        )
        for result in results[:size]
    ]
    return SearchResponse(results=search_results)

def search_chatnoir_phrases(query: str, size: int = 10) -> SearchResponse:
    api_key = os.getenv("CHATNOIR_API_KEY")
    results = search_phrases(api_key, query, index=Index.ClueWeb22, size=size)
    
    search_results = [
        SearchResult(
            title=result.title,
            url=result.target_uri,
            content=result.snippet,
        )
        for result in results[:size]
    ]
    return SearchResponse(results=search_results)

def retrieve_document_contents(uuid: str) -> str:
    contents = cache_contents(uuid, Index.ClueWeb22)
    return contents



    
class SimpleSearchRequest(BaseModel):
    query: str
    size: int = 10

@router.post("/api/v1/search/chatnoir/cw22", response_model=SearchResponse)
async def simple_search_endpoint(body: SimpleSearchRequest):
    try:
        return search_chatnoir_simple(body.query, body.size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class PhraseSearchRequest(BaseModel):
    query: str
    size: int = 10

@router.post("/api/v1/search/phrases", response_model=SearchResponse)
async def phrases_search_endpoint(body: PhraseSearchRequest):
    try:
        return search_chatnoir_phrases(body.query, body.size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DocumentContentsRequest(BaseModel):
    uuid: str

@router.get("/api/v1/search/document/{uuid}", response_model=str)
async def document_retrieval_endpoint(uuid: str):
    try:
        return retrieve_document_contents(uuid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






# New endpoint for Simple Search
class ChatNoirSimpleSearchRequest(BaseModel):
    query: str
    size: int = 10

@router.post("/api/v1/search/chatnoir/cw12")
async def chatnoir_simple_search(body: ChatNoirSimpleSearchRequest):
    params = {
        "apikey": CHATNOIR_API_KEY,
        "query": body.query,
        "size": body.size,
        "index": ["cw12"],
        "pretty": True
    }
    response = requests.post(f"{CHATNOIR_API_URL}/_search", json=params)
    return response.json()

# New endpoint for Phrase Search
class ChatNoirPhraseSearchRequest(BaseModel):
    query: str
    size: int = 10

@router.post("/api/v1/search/chatnoir/phrases")
async def chatnoir_phrase_search(body: ChatNoirPhraseSearchRequest):
    params = {
        "apikey": CHATNOIR_API_KEY,
        "query": body.query,
        "size": body.size,
        "index": ["cw12"],
        "pretty": True
    }
    response = requests.post(f"{CHATNOIR_API_URL}/_phrases", json=params)
    return response.json()

# New endpoint for Retrieving Full Documents
class DocumentContentsRequest(BaseModel):
    uuid: UUID4

@router.get("/api/v1/search/chatnoir/document/{uuid}")
async def chatnoir_retrieve_document(uuid: UUID4):
    response = requests.get(f"{CHATNOIR_API_URL}/cache", params={"uuid": str(uuid), "raw": True})
    return response.text