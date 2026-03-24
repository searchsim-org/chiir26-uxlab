"""
Base Connector class for all service connectors.

This module defines the abstract interface that all connectors must implement,
enabling UXLab to route requests to different backends (OpenAI, Ollama, Bing, etc.)
through a unified API.
"""

from abc import ABC, abstractmethod
from typing import AsyncIterator, Dict, Any, List, Optional

from schemas import ChatResponseEvent, Message, SearchResponse


class BaseConnector(ABC):
    """
    Abstract base class for all service connectors.
    
    Connectors act as adapters between UXLab's unified interface and
    external/local services (LLMs, search engines, vector databases, etc.).
    """
    
    # Connector metadata - override in subclasses
    connector_type: str = "base"
    display_name: str = "Base Connector"
    description: str = "Abstract base connector"
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the connector with configuration.
        
        Args:
            config: Dictionary containing connector-specific configuration
                   (API keys, endpoints, model names, prompts, etc.)
        """
        self.config = config
        self._validate_config()
    
    def _validate_config(self) -> None:
        """
        Validate that required configuration fields are present.
        Override in subclasses to add specific validation.
        """
        pass
    
    @abstractmethod
    async def process_query(
        self, 
        query: str, 
        history: Optional[List[Message]] = None
    ) -> AsyncIterator[ChatResponseEvent]:
        """
        Process a user query and stream response events.
        
        This is the main method for conversational/RAG interactions.
        Yields ChatResponseEvent objects as the response is generated.
        
        Args:
            query: The user's query/message
            history: Optional list of previous messages in the conversation
            
        Yields:
            ChatResponseEvent objects containing search results, text chunks,
            related queries, and stream end signals.
        """
        pass
    
    async def search(self, query: str) -> SearchResponse:
        """
        Perform a search and return results.
        
        This method is for pure search operations (no LLM synthesis).
        Default implementation raises NotImplementedError.
        
        Args:
            query: The search query
            
        Returns:
            SearchResponse with results and optional images
        """
        raise NotImplementedError(
            f"{self.__class__.__name__} does not support direct search"
        )
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the connector's backend service is available.
        
        Returns:
            True if the service is reachable and responding, False otherwise
        """
        pass
    
    @classmethod
    @abstractmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        """
        Return the JSON schema for this connector's configuration.
        
        Used by the dashboard to render configuration forms.
        
        Returns:
            Dictionary describing required and optional configuration fields
        """
        pass
    
    def get_display_info(self) -> Dict[str, str]:
        """
        Get display information for the dashboard.
        
        Returns:
            Dictionary with connector type, name, and description
        """
        return {
            "connector_type": self.connector_type,
            "display_name": self.display_name,
            "description": self.description
        }


class SearchConnector(BaseConnector):
    """
    Base class for search-only connectors (Bing, Tavily, etc.).
    
    These connectors don't have conversational capabilities,
    they just return search results.
    """
    
    connector_type: str = "search"
    
    async def process_query(
        self,
        query: str,
        history: Optional[List[Message]] = None
    ) -> AsyncIterator[ChatResponseEvent]:
        """
        For search connectors, process_query performs a search
        and yields the results as events.
        """
        from schemas import SearchResultStream, StreamEndStream, StreamEvent
        
        search_response = await self.search(query)
        
        yield ChatResponseEvent(
            event=StreamEvent.SEARCH_RESULTS,
            data=SearchResultStream(
                results=search_response.results,
                images=search_response.images
            )
        )
        
        yield ChatResponseEvent(
            event=StreamEvent.STREAM_END,
            data=StreamEndStream()
        )


class LLMConnector(BaseConnector):
    """
    Base class for LLM-based connectors (OpenAI, Ollama, Groq, etc.).
    
    These connectors have conversational capabilities and may also
    integrate with search for RAG functionality.
    """
    
    connector_type: str = "llm"
    
    # Override in subclasses
    supports_streaming: bool = True
    supports_tools: bool = False  # For agentic connectors
    
    def get_system_prompt(self) -> str:
        """Get the system prompt from config or use default."""
        return self.config.get("system_prompt", "You are a helpful assistant.")
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        history: Optional[List[Message]] = None,
        stream: bool = True
    ) -> AsyncIterator[str]:
        """
        Generate text from the LLM.
        
        Args:
            prompt: The prompt to send to the LLM
            history: Optional conversation history
            stream: Whether to stream the response
            
        Yields:
            Text chunks as they are generated
        """
        pass
