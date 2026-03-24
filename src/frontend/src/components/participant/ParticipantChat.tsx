import React, { useState, useRef, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string; content: string }[];
  relatedQueries?: string[];
}

interface ParticipantChatProps {
  studyId: string;
  participantId: number;
  backendName?: string;
}

export default function ParticipantChat({ studyId, participantId, backendName }: ParticipantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    setError(null);

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history from previous messages
    const history = messages.map(m => ({
      content: m.content,
      role: m.role,
    }));

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/studies/${studyId}/participants/${participantId}/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, history }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errData.detail || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let sources: ChatMessage['sources'] = [];
      let relatedQueries: string[] = [];
      let buffer = '';

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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

            if (eventType === 'text-chunk') {
              assistantContent += event.data?.text || '';
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: assistantContent };
                }
                return updated;
              });
            } else if (eventType === 'search-results') {
              sources = (event.data?.results || []).map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content,
              }));
            } else if (eventType === 'related-queries') {
              relatedQueries = event.data?.related_queries || [];
            } else if (eventType === 'error') {
              setError(event.data?.detail || 'An error occurred');
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      // Final update with sources and related queries
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            content: assistantContent || last.content,
            sources: sources?.length ? sources : undefined,
            relatedQueries: relatedQueries.length ? relatedQueries : undefined,
          };
        }
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      // Remove empty assistant message on error
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 space-y-6 mb-6 overflow-auto">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-muted-foreground">Start by asking a question{backendName ? ` using ${backendName}` : ''}.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm p-5 max-w-[75%] shadow-sm">
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-6 max-w-[85%] shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    {loading && i === messages.length - 1 && !msg.content && (
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-border">
                        <div className="text-xs font-semibold mb-3 text-muted-foreground flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Sources</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, si) => (
                            <a
                              key={si}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors"
                            >
                              {(() => { try { return new URL(src.url).hostname; } catch { return src.url; } })()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.relatedQueries && msg.relatedQueries.length > 0 && (
                      <div className="pt-3 mt-3">
                        <div className="text-xs font-semibold mb-2 text-muted-foreground">Related</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.relatedQueries.map((q, qi) => (
                            <button
                              key={qi}
                              onClick={() => { setInput(q); }}
                              className="bg-secondary hover:bg-accent border border-border px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={loading}
            className="flex-1 bg-card border-2 border-border focus:border-blue-500 rounded-2xl px-6 py-4 text-sm outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Continue asking questions until you have enough information to complete the task
        </p>
      </div>
    </div>
  );
}
