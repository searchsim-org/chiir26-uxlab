import React from 'react';

export default function Figure5Interfaces() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          UXLab Interface Modes
        </h1>
        <p className="text-center text-lg text-muted-foreground mb-12">
          Three configurable search paradigms supported by the platform
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Traditional Search (SERP) */}
          <div className="bg-card rounded-xl shadow-xl border-2 border-border overflow-hidden">
            <div className="bg-green-500 text-white p-4 text-center">
              <h2 className="text-2xl font-bold">Traditional Search</h2>
              <p className="text-sm mt-1">SERP Interface</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-4 h-4 bg-muted rounded-full"></div>
                  <div className="flex-grow h-3 bg-muted rounded"></div>
                </div>
                <div className="h-2 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 bg-muted-foreground/30 rounded w-3/4"></div>
              </div>

              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-4 h-4 bg-muted rounded-full"></div>
                  <div className="flex-grow h-3 bg-muted rounded"></div>
                </div>
                <div className="h-2 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 bg-muted-foreground/30 rounded w-2/3"></div>
              </div>

              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-4 h-4 bg-muted rounded-full"></div>
                  <div className="flex-grow h-3 bg-muted rounded"></div>
                </div>
                <div className="h-2 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 bg-muted-foreground/30 rounded mb-2"></div>
                <div className="h-2 bg-muted-foreground/30 rounded w-4/5"></div>
              </div>

              <div className="flex justify-center space-x-2 pt-2">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">1</div>
                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-sm">2</div>
                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-sm">3</div>
                <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-sm">4</div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-2">Characteristics:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ranked list of results</li>
                  <li>• User-driven exploration</li>
                  <li>• Multiple query refinement</li>
                  <li>• Familiar web search model</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RAG / Conversational */}
          <div className="bg-card rounded-xl shadow-xl border-2 border-border overflow-hidden">
            <div className="bg-blue-500 text-white p-4 text-center">
              <h2 className="text-2xl font-bold">RAG System</h2>
              <p className="text-sm mt-1">Conversational Search</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-end">
                <div className="bg-blue-500/20 border border-blue-500 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">What are the best hotels near the airport?</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-secondary p-3 rounded-lg max-w-[85%]">
                  <div className="flex items-start space-x-2 mb-2">
                    <div className="w-6 h-6 bg-tint rounded-full flex-shrink-0"></div>
                    <div className="flex-grow space-y-2">
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded w-4/5"></div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-background rounded text-xs">
                    <div className="font-semibold mb-1">Sources:</div>
                    <div className="flex space-x-1">
                      <div className="bg-blue-500/30 px-2 py-1 rounded">1</div>
                      <div className="bg-blue-500/30 px-2 py-1 rounded">2</div>
                      <div className="bg-blue-500/30 px-2 py-1 rounded">3</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="bg-blue-500/20 border border-blue-500 p-3 rounded-lg max-w-[70%]">
                  <p className="text-sm">What about parking options?</p>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-secondary p-3 rounded-lg max-w-[85%]">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-tint rounded-full flex-shrink-0"></div>
                    <div className="flex-grow space-y-2">
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-2 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-2">Characteristics:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Natural language interaction</li>
                  <li>• Contextualized responses</li>
                  <li>• Source attribution</li>
                  <li>• Follow-up questions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agentic System */}
          <div className="bg-card rounded-xl shadow-xl border-2 border-border overflow-hidden">
            <div className="bg-purple-500 text-white p-4 text-center">
              <h2 className="text-2xl font-bold">Agentic System</h2>
              <p className="text-sm mt-1">Autonomous Agent</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-end">
                <div className="bg-purple-500/20 border border-purple-500 p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">Plan a weekend trip to the coast</p>
                </div>
              </div>

              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-semibold">Agent is working...</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-muted-foreground">Step 1: Searching for coastal destinations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-muted-foreground">Step 2: Checking hotel availability</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0 animate-pulse"></div>
                    <span className="text-muted-foreground">Step 3: Compiling activities...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-muted rounded-full flex-shrink-0"></div>
                    <span className="text-muted-foreground/50">Step 4: Creating itinerary</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-grow space-y-2">
                    <div className="font-semibold text-sm">Trip Plan Generated</div>
                    <div className="h-2 bg-muted rounded"></div>
                    <div className="h-2 bg-muted rounded"></div>
                    <div className="h-2 bg-muted rounded w-4/5"></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-2">Characteristics:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multi-step reasoning</li>
                  <li>• Autonomous task execution</li>
                  <li>• Tool/API integration</li>
                  <li>• Transparent process steps</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 bg-card rounded-xl p-8 shadow-xl border-2 border-border">
          <h2 className="text-2xl font-bold mb-6 text-center">Seamless Backend Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="font-semibold mb-2">No Code Changes</h3>
              <p className="text-sm text-muted-foreground">
                Switch between interfaces through dashboard configuration only
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Instant Deployment</h3>
              <p className="text-sm text-muted-foreground">
                Configure backends and deploy comparative studies in minutes
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Unified Logging</h3>
              <p className="text-sm text-muted-foreground">
                All interactions logged consistently across different modes
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            The same participant interface adapts to any backend through UXLab's modular architecture
          </p>
        </div>
      </div>
    </div>
  );
}

