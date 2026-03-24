"""
OpenAI Connector for RAG-based conversational search.

Integrates OpenAI's GPT models with search for retrieval-augmented generation.
"""

import os
from typing import AsyncIterator, Dict, Any, List, Optional

from .base import LLMConnector

try:
    from schemas import (
        ChatResponseEvent, Message, SearchResultStream, 
        TextChunkStream, RelatedQueriesStream, StreamEndStream,
        FinalResponseStream, StreamEvent, SearchResponse
    )
except ImportError:
    from backend.schemas import (
        ChatResponseEvent, Message, SearchResultStream,
        TextChunkStream, RelatedQueriesStream, StreamEndStream,
        FinalResponseStream, StreamEvent, SearchResponse
    )


class OpenAIConnector(LLMConnector):
    """
    OpenAI-based RAG connector.
    
    Combines OpenAI's language models with search results
    to provide grounded, source-cited responses.
    """
    
    connector_type = "openai"
    display_name = "OpenAI GPT"
    description = "OpenAI GPT models with RAG for grounded responses"
    supports_streaming = True
    supports_tools = False
    
    def _validate_config(self) -> None:
        """Validate required configuration."""
        if not self.config.get("api_key"):
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.config["api_key"] = api_key
            else:
                raise ValueError("OpenAI API key is required")
    
    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        """Return configuration schema for dashboard forms."""
        return {
            "required": ["api_key"],
            "optional": ["model", "temperature", "max_tokens", "system_prompt"],
            "properties": {
                "api_key": {
                    "type": "string",
                    "description": "OpenAI API Key",
                    "secret": True
                },
                "model": {
                    "type": "string",
                    "description": "Model name",
                    "default": "gpt-4-turbo-preview",
                    "enum": ["gpt-4-turbo-preview", "gpt-4o", "gpt-3.5-turbo"]
                },
                "temperature": {
                    "type": "number",
                    "description": "Sampling temperature (0-2)",
                    "default": 0.7,
                    "minimum": 0,
                    "maximum": 2
                },
                "max_tokens": {
                    "type": "integer",
                    "description": "Maximum response tokens",
                    "default": 4096
                },
                "system_prompt": {
                    "type": "string",
                    "description": "Custom system prompt",
                    "default": ""
                }
            }
        }
    
    async def generate(
        self,
        prompt: str,
        history: Optional[List[Message]] = None,
        stream: bool = True
    ) -> AsyncIterator[str]:
        """Generate text using OpenAI's API."""
        from llama_index.llms.openai import OpenAI
        
        model = self.config.get("model", "gpt-4-turbo-preview")
        temperature = self.config.get("temperature", 0.7)
        
        llm = OpenAI(
            api_key=self.config["api_key"],
            model=model,
            temperature=temperature
        )
        
        if stream:
            response_gen = await llm.astream_complete(prompt)
            async for completion in response_gen:
                yield completion.delta or ""
        else:
            response = await llm.acomplete(prompt)
            yield response.text
    
    async def process_query(
        self,
        query: str,
        history: Optional[List[Message]] = None
    ) -> AsyncIterator[ChatResponseEvent]:
        """Process query with RAG: search + LLM synthesis."""
        from llama_index.llms.openai import OpenAI
        
        # First, rephrase query if there's history
        model = self.config.get("model", "gpt-4-turbo-preview")
        llm = OpenAI(api_key=self.config["api_key"], model=model)
        
        search_query = query
        if history and len(history) > 0:
            history_str = "\n".join([f"{msg.role}: {msg.content}" for msg in history])
            rephrase_prompt = f"""Given the conversation history:
{history_str}

Rephrase this follow-up question as a standalone search query: {query}

Standalone query:"""
            rephrase_response = await llm.acomplete(rephrase_prompt)
            search_query = rephrase_response.text.strip().replace('"', '')
        
        # Perform search
        try:
            from search import search_tavily
            search_response = search_tavily(search_query)
            search_results = search_response.results
            images = search_response.images
        except Exception as e:
            search_results = []
            images = []
        
        # Yield search results
        yield ChatResponseEvent(
            event=StreamEvent.SEARCH_RESULTS,
            data=SearchResultStream(results=search_results, images=images)
        )
        
        # Build context from search results
        context_str = "\n\n".join([
            f"Citation {i+1}. {str(result)}"
            for i, result in enumerate(search_results)
        ])
        
        # Get system prompt
        system_prompt = self.config.get("system_prompt", "")
        if not system_prompt:
            system_prompt = """You are a helpful research assistant. Answer questions based on the provided context.
Always cite your sources using [Citation N] format. Be accurate and concise."""
        
        # Build the prompt
        qa_prompt = f"""{system_prompt}

Context from search results:
{context_str}

Question: {query}

Answer (cite sources with [Citation N]):"""
        
        # Stream the response
        full_response = ""
        async for chunk in self.generate(qa_prompt, history, stream=True):
            full_response += chunk
            yield ChatResponseEvent(
                event=StreamEvent.TEXT_CHUNK,
                data=TextChunkStream(text=chunk)
            )
        
        # Generate related queries
        try:
            related_prompt = f"""Based on the query "{query}" and search results, suggest 3 related follow-up questions.
Return only the questions, one per line, no numbering."""
            related_response = await llm.acomplete(related_prompt)
            related_queries = [q.strip() for q in related_response.text.strip().split('\n') if q.strip()][:3]
        except:
            related_queries = []
        
        yield ChatResponseEvent(
            event=StreamEvent.RELATED_QUERIES,
            data=RelatedQueriesStream(related_queries=related_queries)
        )
        
        yield ChatResponseEvent(
            event=StreamEvent.STREAM_END,
            data=StreamEndStream()
        )
        
        yield ChatResponseEvent(
            event=StreamEvent.FINAL_RESPONSE,
            data=FinalResponseStream(message=full_response)
        )
    
    async def health_check(self) -> bool:
        """Check if OpenAI API is accessible."""
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {self.config['api_key']}"},
                    timeout=10.0
                )
                return response.status_code == 200
        except:
            return False
