import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

interface ParticipantSERPProps {
  studyId: string;
  participantId: number;
  backendName?: string;
}

export default function ParticipantSERP({ studyId, participantId, backendName }: ParticipantSERPProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);
    setImages([]);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/studies/${studyId}/participants/${participantId}/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim(), history: [] }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Search failed' }));
        throw new Error(errData.detail || 'Search failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const dataStr = line.slice(5).trim();
          if (!dataStr) continue;

          try {
            const event = JSON.parse(dataStr);
            const eventType = event.data?.event_type || event.event;

            if (eventType === 'search-results') {
              setResults(event.data?.results || []);
              setImages(event.data?.images || []);
            } else if (eventType === 'error') {
              setError(event.data?.detail || 'Search failed');
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex items-center space-x-3"
        >
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search${backendName ? ` with ${backendName}` : ''}...`}
              className="w-full bg-card border-2 border-border focus:border-blue-500 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl text-sm font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Searching...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found. Try a different query.</p>
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground">Enter a search query to get started.</p>
          </div>
        )}

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {images.slice(0, 4).map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-xl border border-border" />
            ))}
          </div>
        )}

        {/* Result cards */}
        {results.map((result, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/30 hover:shadow-sm transition-all">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-semibold text-base mb-1 block"
            >
              {result.title}
            </a>
            <div className="text-xs text-green-600 mb-2 truncate">{result.url}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
