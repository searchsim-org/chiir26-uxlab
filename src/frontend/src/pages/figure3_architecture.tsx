import React from 'react';

export default function Figure3Architecture() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          UXLab System Architecture
        </h1>

        <div className="relative">
          {/* Top Section - Researcher */}
          <div className="flex justify-center mb-12">
            <div className="bg-tint text-tint-foreground px-8 py-4 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="text-6xl mb-2">👤</div>
                <h3 className="text-xl font-bold">Researcher</h3>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-8">
            <svg className="w-8 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Main Components Grid */}
          <div className="grid grid-cols-1 gap-8 mb-12">
            
            {/* Experimenter Dashboard */}
            <div className="bg-card border-4 border-blue-500 rounded-xl p-8 shadow-2xl">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 text-6xl">⚙️</div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-4 text-blue-500">Experimenter Dashboard</h2>
                  <p className="text-muted-foreground mb-4">
                    Web-based control panel for no-code study configuration
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Study Designer</h4>
                      <p className="text-xs text-muted-foreground">Create and manage studies</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Backend Configurator</h4>
                      <p className="text-xs text-muted-foreground">Configure system backends</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Procedure Builder</h4>
                      <p className="text-xs text-muted-foreground">Drag-and-drop flow builder</p>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Data Export</h4>
                      <p className="text-xs text-muted-foreground">One-click CSV export</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row - Backend and Participant Interface */}
            <div className="grid grid-cols-2 gap-8">
              
              {/* Backend */}
              <div className="bg-card border-4 border-green-500 rounded-xl p-6 shadow-2xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-5xl">🖥️</div>
                  <div>
                    <h2 className="text-xl font-bold mb-3 text-green-500">Core Backend</h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      FastAPI server managing study logic and data
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>REST API provision</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Study logic & counterbalancing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>State management</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>PostgreSQL data persistence</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Participant Interface */}
              <div className="bg-card border-4 border-purple-500 rounded-xl p-6 shadow-2xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-5xl">👥</div>
                  <div>
                    <h2 className="text-xl font-bold mb-3 text-purple-500">Participant Interface</h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      Web application for participant interaction
                    </p>
                    <div className="space-y-3">
                      <div className="bg-secondary p-3 rounded">
                        <h4 className="font-semibold text-sm mb-1">Study Navigator</h4>
                        <p className="text-xs text-muted-foreground">Controls participant flow</p>
                      </div>
                      <div className="bg-secondary p-3 rounded">
                        <h4 className="font-semibold text-sm mb-1">Content Window</h4>
                        <p className="text-xs text-muted-foreground">Embedded iframe for prototypes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Connectors */}
            <div className="bg-card border-4 border-orange-500 rounded-xl p-6 shadow-2xl">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 text-5xl">🔌</div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold mb-3 text-orange-500">Service Connectors</h2>
                  <p className="text-muted-foreground mb-4">
                    Modular library for integrating external search, RAG, and agentic systems
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium">
                      OpenAI API
                    </div>
                    <div className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium">
                      Bing Search
                    </div>
                    <div className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium">
                      Ollama (Local LLM)
                    </div>
                    <div className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium">
                      Lucene Index
                    </div>
                    <div className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium">
                      Tavily
                    </div>
                    <div className="bg-secondary px-4 py-2 rounded-lg text-sm font-medium border-2 border-dashed">
                      Custom Endpoint...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Lines (Visual Indicators) */}
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-1 h-20 bg-muted-foreground opacity-30"></div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            Modular architecture enabling flexible experimental designs
          </p>
        </div>
      </div>
    </div>
  );
}

