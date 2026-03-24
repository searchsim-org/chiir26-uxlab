"""
Bing Search Connector for traditional web search.

Provides access to Microsoft Bing Search API for traditional SERP-style
search results without LLM synthesis.
"""

import os
from typing import AsyncIterator, Dict, Any, List, Optional
import asyncio
import httpx

from .base import SearchConnector

try:
    from schemas import SearchResponse, SearchResult
except ImportError:
    from backend.schemas import SearchResponse, SearchResult


class BingConnector(SearchConnector):
    """
    Bing Search API connector.
    
    Provides traditional search results for comparison
    with RAG and agentic systems.
    """
    
    connector_type = "bing"
    display_name = "Bing Search"
    description = "Microsoft Bing Web Search API for traditional search"
    
    def _validate_config(self) -> None:
        """Validate required configuration."""
        if not self.config.get("api_key"):
            api_key = os.getenv("BING_API_KEY")
            if api_key:
                self.config["api_key"] = api_key
            else:
                raise ValueError("Bing API key is required")
    
    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        """Return configuration schema for dashboard forms."""
        return {
            "required": ["api_key"],
            "optional": ["market", "count"],
            "properties": {
                "api_key": {
                    "type": "string",
                    "description": "Bing Search API Key",
                    "secret": True
                },
                "market": {
                    "type": "string",
                    "description": "Market code (e.g., en-US)",
                    "default": "en-US"
                },
                "count": {
                    "type": "integer",
                    "description": "Number of results to return",
                    "default": 10,
                    "minimum": 1,
                    "maximum": 50
                }
            }
        }
    
    async def search(self, query: str) -> SearchResponse:
        """Perform Bing search and return results."""
        host = "https://api.bing.microsoft.com/v7.0"
        headers = {
            "Ocp-Apim-Subscription-Key": self.config["api_key"],
            "Content-Type": "application/json"
        }
        
        count = self.config.get("count", 10)
        market = self.config.get("market", "en-US")
        
        async with httpx.AsyncClient() as client:
            # Fetch web results and images in parallel
            link_results, image_results = await asyncio.gather(
                self._get_link_results(client, host, headers, query, count, market),
                self._get_image_results(client, host, headers, query, 4, market)
            )
        
        return SearchResponse(results=link_results, images=image_results)
    
    async def _get_link_results(
        self,
        client: httpx.AsyncClient,
        host: str,
        headers: Dict[str, str],
        query: str,
        count: int,
        market: str
    ) -> List[SearchResult]:
        """Fetch web search results."""
        try:
            response = await client.get(
                f"{host}/search",
                headers=headers,
                params={
                    "q": query,
                    "count": count,
                    "mkt": market
                },
                timeout=10.0
            )
            results = response.json()
            
            if "webPages" not in results:
                return []
            
            return [
                SearchResult(
                    title=result["name"],
                    url=result["url"],
                    content=result.get("snippet", "")
                )
                for result in results["webPages"]["value"][:count]
            ]
        except Exception as e:
            print(f"Bing search error: {e}")
            return []
    
    async def _get_image_results(
        self,
        client: httpx.AsyncClient,
        host: str,
        headers: Dict[str, str],
        query: str,
        count: int,
        market: str
    ) -> List[str]:
        """Fetch image search results."""
        try:
            response = await client.get(
                f"{host}/images/search",
                headers=headers,
                params={
                    "q": query,
                    "count": count,
                    "mkt": market
                },
                timeout=10.0
            )
            results = response.json()
            
            if "value" not in results:
                return []
            
            return [result["contentUrl"] for result in results["value"][:count]]
        except Exception as e:
            print(f"Bing image search error: {e}")
            return []
    
    async def health_check(self) -> bool:
        """Check if Bing API is accessible."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.bing.microsoft.com/v7.0/search",
                    headers={"Ocp-Apim-Subscription-Key": self.config["api_key"]},
                    params={"q": "test"},
                    timeout=10.0
                )
                return response.status_code == 200
        except:
            return False
