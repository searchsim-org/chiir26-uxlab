"""
Tavily Search Connector for AI-optimized web search.

Tavily provides search results optimized for RAG applications,
including content summaries and relevant context.
"""

import os
from typing import AsyncIterator, Dict, Any, List, Optional

from .base import SearchConnector

try:
    from schemas import SearchResponse, SearchResult
except ImportError:
    from backend.schemas import SearchResponse, SearchResult


class TavilyConnector(SearchConnector):
    """
    Tavily Search API connector.
    
    Provides AI-optimized search results with content extraction
    ideal for RAG applications.
    """
    
    connector_type = "tavily"
    display_name = "Tavily Search"
    description = "AI-optimized web search with content extraction"
    
    def _validate_config(self) -> None:
        """Validate required configuration."""
        if not self.config.get("api_key"):
            api_key = os.getenv("TAVILY_API_KEY")
            if api_key:
                self.config["api_key"] = api_key
            else:
                raise ValueError("Tavily API key is required")
    
    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        """Return configuration schema for dashboard forms."""
        return {
            "required": ["api_key"],
            "optional": ["search_depth", "max_results", "include_images"],
            "properties": {
                "api_key": {
                    "type": "string",
                    "description": "Tavily API Key",
                    "secret": True
                },
                "search_depth": {
                    "type": "string",
                    "description": "Search depth",
                    "default": "basic",
                    "enum": ["basic", "advanced"]
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum results to return",
                    "default": 6,
                    "minimum": 1,
                    "maximum": 20
                },
                "include_images": {
                    "type": "boolean",
                    "description": "Include image results",
                    "default": True
                }
            }
        }
    
    async def search(self, query: str) -> SearchResponse:
        """Perform Tavily search and return results."""
        from tavily import TavilyClient
        
        tavily = TavilyClient(api_key=self.config["api_key"])
        
        search_depth = self.config.get("search_depth", "basic")
        max_results = self.config.get("max_results", 6)
        include_images = self.config.get("include_images", True)
        
        try:
            response = tavily.search(
                query=query,
                search_depth=search_depth,
                max_results=max_results,
                include_images=include_images
            )
            
            if response is None:
                return SearchResponse(results=[], images=[])
            
            results = [
                SearchResult(
                    title=result["title"],
                    url=result["url"],
                    content=result["content"]
                )
                for result in response.get("results", [])
            ]
            
            images = response.get("images", []) if include_images else []
            
            return SearchResponse(results=results, images=images)
            
        except Exception as e:
            print(f"Tavily search error: {e}")
            return SearchResponse(results=[], images=[])
    
    async def health_check(self) -> bool:
        """
        Check if Tavily API is accessible.
        
        Note: Tavily doesn't have a dedicated health endpoint,
        so we just verify the API key format.
        """
        api_key = self.config.get("api_key", "")
        # Basic validation - Tavily keys start with "tvly-"
        return api_key.startswith("tvly-") and len(api_key) > 10
