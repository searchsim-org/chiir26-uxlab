"""
OpenAI Agentic Connector for multi-step autonomous search.

Implements an agentic search system that can autonomously plan and execute
multiple search steps to answer complex queries.
"""

import os
from typing import AsyncIterator, Dict, Any, List, Optional

from .base import LLMConnector

try:
    from schemas import (
        ChatResponseEvent, Message, SearchResultStream,
        TextChunkStream, RelatedQueriesStream, StreamEndStream,
        FinalResponseStream, StreamEvent, SearchQueryStream
    )
except ImportError:
    from backend.schemas import (
        ChatResponseEvent, Message, SearchResultStream,
        TextChunkStream, RelatedQueriesStream, StreamEndStream,
        FinalResponseStream, StreamEvent, SearchQueryStream
    )


class OpenAIAgenticConnector(LLMConnector):
    """
    OpenAI-based Agentic connector for autonomous multi-step search.
    
    This connector implements a ReAct-style agent that can:
    1. Analyze the query and create a search plan
    2. Execute multiple search queries
    3. Synthesize results into a comprehensive answer
    """
    
    connector_type = "openai_agentic"
    display_name = "OpenAI Agentic"
    description = "Autonomous multi-step search agent powered by GPT-4"
    supports_streaming = True
    supports_tools = True
    
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
            "optional": ["model", "temperature", "max_steps", "system_prompt"],
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
                    "enum": ["gpt-4-turbo-preview", "gpt-4o"]
                },
                "temperature": {
                    "type": "number",
                    "description": "Sampling temperature",
                    "default": 0.7,
                    "minimum": 0,
                    "maximum": 2
                },
                "max_steps": {
                    "type": "integer",
                    "description": "Maximum search steps",
                    "default": 3,
                    "minimum": 1,
                    "maximum": 10
                },
                "system_prompt": {
                    "type": "string",
                    "description": "Custom system prompt for the agent",
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
    
    async def _create_search_plan(self, query: str) -> List[str]:
        """Create a plan of search queries to answer the user's question."""
        from llama_index.llms.openai import OpenAI
        
        llm = OpenAI(
            api_key=self.config["api_key"],
            model=self.config.get("model", "gpt-4-turbo-preview")
        )
        
        plan_prompt = f"""You are a research planning assistant. Given a complex user query, 
break it down into specific search queries that will help gather all necessary information.

User Query: {query}

Generate 2-4 specific search queries that together will help answer this question comprehensively.
Return ONLY the search queries, one per line, no numbering or explanations.
"""
        
        response = await llm.acomplete(plan_prompt)
        queries = [q.strip() for q in response.text.strip().split('\n') if q.strip()]
        
        max_steps = self.config.get("max_steps", 3)
        return queries[:max_steps]
    
    async def process_query(
        self,
        query: str,
        history: Optional[List[Message]] = None
    ) -> AsyncIterator[ChatResponseEvent]:
        """Process query with multi-step agentic search."""
        from llama_index.llms.openai import OpenAI
        
        # Step 1: Create search plan
        search_queries = await self._create_search_plan(query)
        
        # Step 2: Execute searches
        all_results = []
        all_images = []
        
        try:
            from search import search_tavily
            
            for search_query in search_queries:
                # Notify about the search
                yield ChatResponseEvent(
                    event=StreamEvent.SEARCH_QUERY,
                    data=SearchQueryStream(query=search_query)
                )
                
                # Execute search
                search_response = search_tavily(search_query)
                all_results.extend(search_response.results)
                all_images.extend(search_response.images)
        except Exception as e:
            print(f"Search error: {e}")
        
        # Deduplicate results by URL
        seen_urls = set()
        unique_results = []
        for result in all_results:
            if result.url not in seen_urls:
                seen_urls.add(result.url)
                unique_results.append(result)
        
        # Limit results
        unique_results = unique_results[:10]
        all_images = list(set(all_images))[:6]
        
        # Yield aggregated search results
        yield ChatResponseEvent(
            event=StreamEvent.SEARCH_RESULTS,
            data=SearchResultStream(results=unique_results, images=all_images)
        )
        
        # Step 3: Build comprehensive context
        context_str = "\n\n".join([
            f"Source {i+1}: {result.title}\nURL: {result.url}\nContent: {result.content}"
            for i, result in enumerate(unique_results)
        ])
        
        # Get system prompt for synthesis
        system_prompt = self.config.get("system_prompt", "")
        if not system_prompt:
            system_prompt = """You are an expert research assistant that synthesizes information from multiple sources.
Your task is to provide a comprehensive, well-organized answer based on the gathered information.
Always cite your sources using [Source N] format."""
        
        synthesis_prompt = f"""{system_prompt}

I searched for the following queries to answer the user's question:
{chr(10).join(f'- {q}' for q in search_queries)}

Here is the information gathered from multiple sources:

{context_str}

User's Original Question: {query}

Provide a comprehensive answer based on the gathered information. Organize your response clearly and cite all sources."""
        
        # Step 4: Stream the synthesized response
        full_response = ""
        async for chunk in self.generate(synthesis_prompt, history, stream=True):
            full_response += chunk
            yield ChatResponseEvent(
                event=StreamEvent.TEXT_CHUNK,
                data=TextChunkStream(text=chunk)
            )
        
        # Generate related queries
        llm = OpenAI(
            api_key=self.config["api_key"],
            model=self.config.get("model", "gpt-4-turbo-preview")
        )
        
        try:
            related_prompt = f"""Based on the query "{query}" and the comprehensive research done, 
suggest 3 related follow-up questions the user might want to explore.
Return only the questions, one per line."""
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
