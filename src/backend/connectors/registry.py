"""
Connector Registry for dynamic connector selection and management.

The registry allows UXLab to:
1. Register available connector types
2. Instantiate connectors from saved configurations
3. Provide metadata for the dashboard
"""

from typing import Dict, Type, Optional, Any, List
import json

from .base import BaseConnector


class ConnectorRegistry:
    """
    Singleton registry for managing available connector types.
    
    Usage:
        # Register a connector type
        ConnectorRegistry.register(OpenAIConnector)
        
        # Create a connector instance from config
        connector = ConnectorRegistry.create("openai", {"api_key": "..."})
        
        # Get all available connector types
        types = ConnectorRegistry.list_types()
    """
    
    _connectors: Dict[str, Type[BaseConnector]] = {}
    
    @classmethod
    def register(cls, connector_class: Type[BaseConnector]) -> None:
        """
        Register a connector class.
        
        Args:
            connector_class: A class that extends BaseConnector
        """
        connector_type = connector_class.connector_type
        if connector_type in cls._connectors:
            raise ValueError(f"Connector type '{connector_type}' is already registered")
        cls._connectors[connector_type] = connector_class
    
    @classmethod
    def unregister(cls, connector_type: str) -> None:
        """
        Unregister a connector type.
        
        Args:
            connector_type: The type identifier to unregister
        """
        if connector_type in cls._connectors:
            del cls._connectors[connector_type]
    
    @classmethod
    def get(cls, connector_type: str) -> Optional[Type[BaseConnector]]:
        """
        Get a connector class by type.
        
        Args:
            connector_type: The type identifier
            
        Returns:
            The connector class or None if not found
        """
        return cls._connectors.get(connector_type)
    
    @classmethod
    def create(cls, connector_type: str, config: Dict[str, Any]) -> BaseConnector:
        """
        Create a connector instance from type and configuration.
        
        Args:
            connector_type: The type identifier
            config: Configuration dictionary
            
        Returns:
            An instantiated connector
            
        Raises:
            ValueError: If the connector type is not registered
        """
        connector_class = cls.get(connector_type)
        if connector_class is None:
            raise ValueError(f"Unknown connector type: {connector_type}")
        return connector_class(config)
    
    @classmethod
    def create_from_db_config(cls, db_config) -> BaseConnector:
        """
        Create a connector from a BackendConfig database model.
        
        Args:
            db_config: BackendConfig model instance
            
        Returns:
            An instantiated connector
        """
        config = json.loads(db_config.config_json) if db_config.config_json else {}
        return cls.create(db_config.connector_type, config)
    
    @classmethod
    def list_types(cls) -> List[str]:
        """
        List all registered connector types.
        
        Returns:
            List of type identifiers
        """
        return list(cls._connectors.keys())
    
    @classmethod
    def list_all(cls) -> List[Dict[str, Any]]:
        """
        List all registered connectors with their metadata.
        
        Returns:
            List of dictionaries with connector info and config schemas
        """
        result = []
        for connector_type, connector_class in cls._connectors.items():
            result.append({
                "connector_type": connector_type,
                "display_name": connector_class.display_name,
                "description": connector_class.description,
                "config_schema": connector_class.get_config_schema()
            })
        return result
    
    @classmethod
    def get_config_schema(cls, connector_type: str) -> Optional[Dict[str, Any]]:
        """
        Get the configuration schema for a connector type.
        
        Args:
            connector_type: The type identifier
            
        Returns:
            Configuration schema dictionary or None
        """
        connector_class = cls.get(connector_type)
        if connector_class:
            return connector_class.get_config_schema()
        return None


def register_default_connectors():
    """
    Register all built-in connector types.
    
    Call this at application startup to make all connectors available.
    """
    # Import and register connectors here to avoid circular imports
    try:
        from .openai_connector import OpenAIConnector
        ConnectorRegistry.register(OpenAIConnector)
    except ImportError:
        pass
    
    try:
        from .openai_agentic import OpenAIAgenticConnector
        ConnectorRegistry.register(OpenAIAgenticConnector)
    except ImportError:
        pass
    
    try:
        from .ollama_connector import OllamaConnector
        ConnectorRegistry.register(OllamaConnector)
    except ImportError:
        pass
    
    try:
        from .bing_connector import BingConnector
        ConnectorRegistry.register(BingConnector)
    except ImportError:
        pass
    
    try:
        from .tavily_connector import TavilyConnector
        ConnectorRegistry.register(TavilyConnector)
    except ImportError:
        pass
