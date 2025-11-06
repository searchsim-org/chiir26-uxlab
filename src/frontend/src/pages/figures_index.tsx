import React from 'react';
import { useRouter } from 'next/router';

export default function FiguresIndex() {
  const router = useRouter();

  const diagrams = [
    {
      id: 'figure2',
      title: 'Figure 2: UXLab Research Workflow',
      description: 'Illustrates the process of setting up a web-based experiment, separating researcher responsibilities from automated tasks',
      path: '/figure2_workflow',
      color: 'blue'
    },
    {
      id: 'figure3',
      title: 'Figure 3: System Architecture Overview',
      description: 'Shows the four-part architecture: Experimenter Dashboard, Backend, Participant Interface, and Service Connectors',
      path: '/figure3_architecture',
      color: 'green'
    },
    {
      id: 'figure4',
      title: 'Figure 4: Typical Study Designs',
      description: 'Demonstrates three common experimental designs: Between-Subject, Within-Subject, and Interrupted Time-Series',
      path: '/figure4_designs',
      color: 'purple'
    },
    {
      id: 'figure5',
      title: 'Figure 5: Interface Modes Comparison',
      description: 'Visual comparison of the three search paradigms: Traditional SERP, RAG/Conversational, and Agentic interfaces',
      path: '/figure5_interfaces',
      color: 'orange'
    }
  ];

  const interfaces = [
    {
      id: 'dashboard',
      title: 'Experimenter Dashboard',
      description: 'Professional control panel with tabs for study management, backend configuration, participant tracking, and data export. Features realistic mock data and clean design.',
      path: '/dashboard',
      color: 'blue',
    },
    {
      id: 'procedure',
      title: 'Procedure Builder',
      description: 'Visual drag-and-drop interface for composing study procedures. Includes component library, counterbalancing blocks, and step configuration panel.',
      path: '/dashboard/procedure-builder',
      color: 'green',
    },
    {
      id: 'participant-rag',
      title: 'Participant View: GPT-4 RAG System',
      description: 'Study Navigator with conversational interface, source citations, and realistic multi-turn dialogue about information-seeking tasks.',
      path: '/participant-view',
      color: 'purple',
    },
    {
      id: 'participant-serp',
      title: 'Participant View: Traditional Search',
      description: 'Study Navigator with traditional SERP interface, search results, pagination, and result relevance marking functionality.',
      path: '/participant-serp',
      color: 'orange',
    }
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-background bg-page-background bg-cover">
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">UXLab Visual Pages</h1>
          <p className="text-xl text-muted-foreground">
            Manuscript diagrams and functional interface mockups
          </p>
        </div>

        {/* Manuscript Diagrams Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">📊 Manuscript Diagrams</h2>
          <p className="text-muted-foreground mb-8">
            Visual diagrams for manuscript figures showing workflows, architecture, and study designs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diagrams.map((figure) => (
              <div 
                key={figure.id}
                className="bg-card rounded-xl shadow-xl border-2 border-border hover:border-tint transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleNavigate(figure.path)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 bg-${figure.color}-500 rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                      {figure.id === 'figure2' ? '📋' : figure.id === 'figure3' ? '🏗️' : figure.id === 'figure4' ? '📊' : '🖥️'}
                    </div>
                  </div>
                  <h2 className="text-lg font-bold mb-3 text-center">
                    {figure.title}
                  </h2>
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    {figure.description}
                  </p>
                  <button 
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(figure.path);
                    }}
                  >
                    View Diagram
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Interfaces Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">🖥️ Functional Interfaces (with Mock Data)</h2>
          <p className="text-muted-foreground mb-8">
            Full interface mockups showing the actual UXLab system that researchers and participants interact with
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interfaces.map((interface_) => (
              <div 
                key={interface_.id}
                className="bg-card rounded-xl shadow-xl border-2 border-border hover:border-tint transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigate(interface_.path)}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br from-${interface_.color}-500 to-${interface_.color}-600 rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {interface_.id === 'dashboard' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        )}
                        {interface_.id === 'procedure' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        )}
                        {interface_.id === 'participant-rag' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        )}
                        {interface_.id === 'participant-serp' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">
                        {interface_.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {interface_.description}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate(interface_.path);
                    }}
                  >
                    View Interface
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-card rounded-xl p-8 shadow-xl border-2 border-border">
          <h2 className="text-2xl font-bold mb-4">Screenshot Instructions</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>1. Click on any figure card above to view the full-size page</p>
            <p>2. Use your browser's full-screen mode for clean screenshots (F11 on most browsers)</p>
            <p>3. Adjust zoom level if needed (Cmd/Ctrl + or -) to fit the entire figure in view</p>
            <p>4. Take a screenshot using your preferred tool</p>
            <p>5. Use browser's back button or navigate directly to return to this index</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground italic">
            All figures are styled to match the UXLab design system for consistency
          </p>
        </div>
      </div>
    </div>
  );
}

