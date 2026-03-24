"""
Ollama Connector for local LLM inference.

Enables use of locally-running LLMs through Ollama for privacy-preserving
or offline research scenarios.
"""

import os
from typing import AsyncIterator, Dict, Any, List, Optional

from .base import LLMConnector

try:
    from schemas import (
        ChatResponseEvent, Message, SearchResultStream,
        TextChunkStream, RelatedQueriesStream, StreamEndStream,
        FinalResponseStream, StreamEvent
    )
except ImportError:
    from backend.schemas import (
        ChatResponseEvent, Message, SearchResultStream,
        TextChunkStream, RelatedQueriesStream, StreamEndStream,
        FinalResponseStream, StreamEvent
    )


class OllamaConnector(LLMConnector):
    """
    Ollama-based local LLM connector.
    
    Uses locally-running Ollama server for LLM inference.
    Supports models like Llama 3, Mistral, Gemma, etc.
    """
    
    connector_type = "ollama"
    display_name = "Ollama (Local LLM)"
    description = "Local LLM inference via Ollama server"
    supports_streaming = True
    supports_tools = False
    
    def _validate_config(self) -> None:
        """Validate required configuration."""
        if not self.config.get("base_url"):
            self.config["base_url"] = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        if not self.config.get("model"):
            self.config["model"] = "llama3"
    
    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        """Return configuration schema for dashboard forms."""
        return {
            "required": ["base_url", "model"],
            "optional": ["temperature", "max_tokens", "system_prompt"],
            "properties": {
                "base_url": {
                    "type": "string",
                    "description": "Ollama server URL",
                    "default": "http://localhost:11434"
                },
                "model": {
                    "type": "string",
                    "description": "Model name",
                    "default": "llama3",
                    "enum": ["llama3", "llama3:70b", "mistral", "gemma", "mixtral"]
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
        """Generate text using Ollama."""
        from llama_index.llms.ollama import Ollama
        
        llm = Ollama(
            base_url=self.config["base_url"],
            model=self.config["model"],
            temperature=self.config.get("temperature", 0.7),
            request_timeout=120.0
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
        """Process query with local LLM + optional search."""
        from llama_index.llms.ollama import Ollama
        
        llm = Ollama(
            base_url=self.config["base_url"],
            model=self.config["model"]
        )
        
        # Optionally integrate search for RAG
        search_results = []
        images = []
        
        try:
            from search import search_tavily
            search_response = search_tavily(query)
            search_results = search_response.results
            images = search_response.images
        except Exception:
            pass  # Continue without search if unavailable
        
        # Yield search results if available
        if search_results:
            yield ChatResponseEvent(
                event=StreamEvent.SEARCH_RESULTS,
                data=SearchResultStream(results=search_results, images=images)
            )
        
        # Build context
        context_str = ""
        if search_results:
            context_str = "\n\n".join([
                f"Citation {i+1}. {str(result)}"
                for i, result in enumerate(search_results)
            ])
        
        # Build prompt
        system_prompt = self.config.get("system_prompt", "")
        if not system_prompt:
            system_prompt = "You are a helpful assistant. Answer questions accurately and concisely."
        
        if context_str:
            prompt = f"""{system_prompt}

Context:
{context_str}

Question: {query}

Answer:"""
        else:
            prompt = f"""{system_prompt}

Question: {query}

Answer:"""
        
        # Stream response
        full_response = ""
        async for chunk in self.generate(prompt, history, stream=True):
            full_response += chunk
            yield ChatResponseEvent(
                event=StreamEvent.TEXT_CHUNK,
                data=TextChunkStream(text=chunk)
            )
        
        # For local models, skip related queries to save time
        yield ChatResponseEvent(
            event=StreamEvent.RELATED_QUERIES,
            data=RelatedQueriesStream(related_queries=[])
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
        """Check if Ollama server is running and accessible."""
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.config['base_url']}/api/tags",
                    timeout=5.0
                )
                return response.status_code == 200
        except:
            return False
