import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SearchResult, AssistantMessage, ChatMessage, MessageType } from "@/types";
import { useMessageStore } from "@/stores";
import { env } from "../env.mjs";
import { logUserAction } from "../services/apiService";
import Cookies from 'js-cookie';

const BASE_URL = env.NEXT_PUBLIC_API_URL;

interface ChatNoirSearchRequest {
    query: string;
    size?: number;
}

interface ChatNoirSearchResponse {
    results: SearchResult[];
}

export const useChatNoirSearch = () => {
    const { addMessage } = useMessageStore();
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [streamingMessage, setStreamingMessage] = useState<AssistantMessage | null>(null);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [isIndexError, setIsIndexError] = useState(false);

    const { mutateAsync: searchChatNoir } = useMutation<ChatNoirSearchResponse, Error, ChatNoirSearchRequest & { index: string }>({
        mutationFn: async ({ query, size = 100, index }) => {
            const response = await fetch(`${BASE_URL}/api/v1/search/chatnoir/${index}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query, size }),
            });

            if (response.status === 500) {
                setIsWaitingForResponse(false);
                setIsIndexError(true);
                setSearchResults([]);
                Cookies.set('currentQuery', query);

                const formattedResults = `The Clueweb22 index did not return any results for the query "${query}" due to a 500 Internal Server Error.`;
                if (formattedResults) {
                    const userId = Cookies.get('user_id') || 'unknown_user';
                    const taskId = Cookies.get('currentTask') || 'unknown_task';
                    const timestamp = Math.floor(new Date().getTime() / 1000);

                    await logUserAction({
                        user_id: userId,
                        task_id: taskId,
                        action: 'QUERY_REFORM',
                        query: query,
                        content: `INFO: page=1 ${formattedResults}`,
                        timestamp: timestamp,
                    });
                }

                console.error('Search failed:', response.statusText);
                throw new Error('500 Internal Server Error');
            }

            if (!response.ok) {
                setIsWaitingForResponse(false);
                throw new Error('Network response was not ok');
            }

            return response.json();
        },
        onSuccess: async (data, variables) => {
            setIsWaitingForResponse(false);
            setIsIndexError(false);
            setSearchResults(data.results);
            const state = {
                response: variables.query,
                sources: data.results ?? [],
                relatedQuestions: [],
                images: [],
            };
            addMessage({
                role: MessageType.ASSISTANT,
                content: state.response,
                relatedQuestions: state.relatedQuestions,
                sources: state.sources,
                images: state.images,
            });
            setStreamingMessage(null);

            Cookies.set('currentQuery', variables.query);
            const index = Cookies.get('ChatNoirIndex') || '';

            // Format the content of the first 10 search results in one line
            const formattedResults = data.results.slice(0, 10).map((result, idx) => {
                // Curate snippet and title based on index
                const contentField = index === 'cw12' ? `${result.snippet}` : `${result.content}`;
                const curatedContent = contentField ? contentField.replace(/[^\w\s]|_/g, "")
                    .replace(/\s+/g, ' ').trim() : "";
                const curatedTitle = result.title ? result.title.replace(/[^\w\s]|_/g, "")
                    .replace(/\s+/g, ' ').trim() : "";
                const uri = index === 'cw12' ? `${result.cache_uri}&raw` : result.url;
                return `rank=${idx + 1} src=${uri} title=${curatedTitle} snippet=${curatedContent}`;
            }).join(' ');

            if (formattedResults) {
                const userId = Cookies.get('user_id') || 'unknown_user';
                const taskId = Cookies.get('currentTask') || 'unknown_task';
                const timestamp = Math.floor(new Date().getTime() / 1000);

                await logUserAction({
                    user_id: userId,
                    task_id: taskId,
                    action: 'QUERY_REFORM',
                    query: variables.query,
                    content: `INFO: page=1 ${formattedResults}`,
                    timestamp: timestamp,
                });
            }

        },
    });

    const handleChatNoirSend = async (query: string, index: string) => {
        setIsWaitingForResponse(true);
        setStreamingMessage({
            role: MessageType.ASSISTANT,
            content: query,
            relatedQuestions: [],
            sources: [],
            images: [],
        });
        await searchChatNoir({ query, index });
    };

    return { handleChatNoirSend, searchResults, streamingMessage, isWaitingForResponse, isIndexError };
};