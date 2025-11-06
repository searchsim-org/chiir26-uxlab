import React, { useState } from 'react';
import { SearchResult } from "@/types";
import { logUserAction } from "../services/apiService";
import Cookies from 'js-cookie';

interface SERPResultsProps {
    results: SearchResult[];
    searchEngine?: string;
}

const SERPResults: React.FC<SERPResultsProps> = ({ results, searchEngine }) => {
    const [relevantResults, setRelevantResults] = useState<Record<number, boolean>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    const stripHtmlTags = (str?: string) => {
        if (!str) return '';
        return str.replace(/<[^>]*>/g, '');
    };

    const handleLinkClick = async (index: number) => {
        // Adjust index based on current page and results per page
        const adjustedIndex = (currentPage - 1) * resultsPerPage + index;
        const resultToLog = results[adjustedIndex];
        const curatedSnippet = resultToLog.snippet ? resultToLog.snippet.replace(/[^\w\s]|_/g, "")
            .replace(/\s+/g, ' ').trim() : "";
        const curatedTitle = resultToLog.title ? resultToLog.title.replace(/[^\w\s]|_/g, "")
            .replace(/\s+/g, ' ').trim() : "";

        // Prepare data for logging
        const userId = Cookies.get('user_id') || 'unknown_user';
        const currentQuery = Cookies.get('currentQuery') || 'unknown_query';
        const taskId = Cookies.get('currentTask') || 'unknown_task';

        // Construct content string
        const content = `INFO page=${currentPage} rank=${adjustedIndex + 1} src=${resultToLog.cache_uri}&raw title=${curatedTitle} snippet=${curatedSnippet}`;

        // Call logUserAction here
        await logUserAction({
            user_id: userId,
            task_id: taskId,
            action: 'CLICK',
            query: currentQuery,
            content: content,
            timestamp: Math.floor(new Date().getTime() / 1000),
        });
    };

    const paginate = async (pageNumber: number) => {
        setCurrentPage(pageNumber);
        // Prepare data for logging
        const userId = Cookies.get('user_id') || 'unknown_user';
        const currentQuery = Cookies.get('currentQuery') || 'unknown_query';
        const taskId = Cookies.get('currentTask') || 'unknown_task';
        const startIndex = (pageNumber - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        const formattedResults = results.slice(startIndex, endIndex).map((result, index) => {
            const curatedSnippet = result.snippet ? result.snippet.replace(/[^\w\s]|_/g, "")
                .replace(/\s+/g, ' ').trim() : "";
            const curatedTitle = result.title ? result.title.replace(/[^\w\s]|_/g, "")
                .replace(/\s+/g, ' ').trim() : "";
            return `rank=${startIndex + index + 1} src=${result.cache_uri}&raw title=${curatedTitle} snippet=${curatedSnippet}`;
        }).join(' ');

        if (formattedResults) {
            await logUserAction({
                user_id: userId,
                task_id: taskId,
                action: 'PAGINATION',
                query: currentQuery,
                content: `INFO: page=${pageNumber} ${formattedResults}`,
                timestamp: Math.floor(new Date().getTime() / 1000),
            });
        }
    };
    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    const currentResults = results.slice(indexOfFirstResult, indexOfLastResult);
    const chatNoirIndex = Cookies.get('ChatNoirIndex')

    const toggleRelevance = async (index: number, event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        event.stopPropagation(); // Prevent triggering the link
        const adjustedIndex = (currentPage - 1) * resultsPerPage + index;
        const newRelevanceState = !relevantResults[adjustedIndex];
        setRelevantResults(prev => ({ ...prev, [adjustedIndex]: newRelevanceState }));

        // Prepare data for logging
        const userId = Cookies.get('user_id') || 'unknown_user';
        const currentQuery = Cookies.get('currentQuery') || 'unknown_query';
        const taskId = Cookies.get('currentTask') || 'unknown_task';
        const resultToLog = results[adjustedIndex];
        const curatedSnippet = searchEngine === "ChatNoir" && chatNoirIndex === 'cw22' ? resultToLog.content : resultToLog.snippet ? resultToLog.snippet.replace(/[^\w\s]|_/g, "")
            .replace(/\s+/g, ' ').trim() : "";
        const curatedTitle = resultToLog.title ? resultToLog.title.replace(/[^\w\s]|_/g, "")
            .replace(/\s+/g, ' ').trim() : "";
        const actionType = newRelevanceState ? 'MARK_RELEVANT' : 'MARK_IRRELEVANT';

        // Construct content string
        const content = `INFO page=${currentPage} rank=${index + 1} src=${searchEngine === "ChatNoir" && chatNoirIndex === 'cw22' ? resultToLog.url : resultToLog.cache_uri}&raw title=${curatedTitle} snippet=${curatedSnippet}`;

        // Call logUserAction here
        await logUserAction({
            user_id: userId,
            task_id: taskId,
            action: actionType,
            query: currentQuery,
            content: content,
            timestamp: Math.floor(new Date().getTime() / 1000),
        });
    };

    const truncateContent = (content: string) => {
        return content.length > 320 ? content.substring(0, 320) + '...' : content;
    };

    // SVG Star Icon with dynamic styling based on relevance
    const StarIcon = ({ isRelevant, onClick }: { isRelevant: boolean; onClick: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void; }) => (
        <svg onClick={onClick} className={`ml-auto w-6 h-6 ${isRelevant ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ minWidth: '24px', minHeight: '24px' }}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
    );


    return (
        <div className="container mx-auto px-4">
            {currentResults.map((result, index) => (
                <div key={index} className="mb-8 flex justify-between items-start">
                    <div className="flex-grow">
                        {/* Use cache_uri if searchEngine is ChatNoir, otherwise use result.url */}
                        <a href={searchEngine === "ChatNoir" && chatNoirIndex === 'cw22' ? result.url : searchEngine === "ChatNoir" && chatNoirIndex === 'cw12' ? `${result.cache_uri}&raw` : result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => handleLinkClick(index)}>
                            {searchEngine === "ChatNoir" && chatNoirIndex === 'cw22' ? result.url : searchEngine === "ChatNoir" && chatNoirIndex === 'cw12' ? `${result.cache_uri}&raw` : result.url}
                        </a>
                        <a href={searchEngine === "ChatNoir" && chatNoirIndex === 'cw22' ? result.url : searchEngine === "ChatNoir" && chatNoirIndex === 'cw12' ? `${result.cache_uri}&raw` : result.url} target="_blank" rel="noopener noreferrer">
                            <h3 className="text-lg text-blue-500 font-medium hover:underline dark:text-blue-400 flex items-center" onClick={() => handleLinkClick(index)}>
                                {/* Show title without HTML tags */}
                                {stripHtmlTags(result.title)}
                            </h3>
                        </a>
                        {/* Show snippet without HTML tags */}
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {searchEngine === "ChatNoir" && chatNoirIndex === 'cw22' ? truncateContent(stripHtmlTags(result.content)) : searchEngine === "ChatNoir" && chatNoirIndex === 'cw12' ? truncateContent(stripHtmlTags(result.snippet)) : result.content}
                        </p>
                    </div>
                    <StarIcon isRelevant={!!relevantResults[(currentPage - 1) * resultsPerPage + index]} onClick={(event) => toggleRelevance(index, event)} />
                </div>
            ))}
            {/* Pagination component */}
            <div className="flex justify-center">
                <div className="flex rounded-md mt-8">
                    {Array.from({ length: Math.ceil(results.length / resultsPerPage) }, (_, i) => i + 1).map(number => (
                        <a key={number} onClick={() => paginate(number)} href="#" className={`first:ml-0 text-xs font-semibold flex w-8 h-8 mx-1 p-0 justify-center items-center leading-tight relative border border-solid border-gray-300 ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}>
                            {number}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );

};

export default SERPResults;