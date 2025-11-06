import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function ProcedureBuilder() {
  const router = useRouter();
  
  const [procedureSteps, setProcedureSteps] = useState([
    { id: 1, type: 'briefing', title: 'Study Introduction & Consent', content: 'Welcome participants and obtain informed consent' },
    { id: 2, type: 'questionnaire', title: 'Demographics Survey', content: 'Pre-study questionnaire (Age, Education, Search Experience)' },
    { id: 3, type: 'block', title: 'Counterbalanced Conditions', isCounterbalanced: true, children: [
      { id: 31, type: 'condition', title: 'Condition A: GPT-4 RAG System', backend: 'OpenAI GPT-4 Turbo', duration: '15 min' },
      { id: 32, type: 'condition', title: 'Condition B: Traditional Search (Bing)', backend: 'Bing Search API', duration: '15 min' }
    ]},
    { id: 4, type: 'questionnaire', title: 'System Usability Scale (SUS)', content: 'Post-task usability assessment' },
    { id: 5, type: 'questionnaire', title: 'Preference & Satisfaction Questions', content: 'Comparative preference questionnaire' },
    { id: 6, type: 'end', title: 'Study Completion', content: 'Thank you message and completion code generation' }
  ]);

  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const availableComponents = [
    { type: 'briefing', label: 'Briefing Page', color: 'blue', icon: 'document' },
    { type: 'questionnaire', label: 'Questionnaire', color: 'green', icon: 'form' },
    { type: 'condition', label: 'Task Condition', color: 'purple', icon: 'task' },
    { type: 'block', label: 'Block (Counterbalanced)', color: 'orange', icon: 'group' },
    { type: 'pause', label: 'Pause/Delay', color: 'yellow', icon: 'pause' },
    { type: 'end', label: 'End Page', color: 'red', icon: 'flag' }
  ];

  const getStepIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      briefing: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      questionnaire: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      condition: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      block: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      pause: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      end: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[type] || icons.briefing;
  };

  const getStepColor = (type: string) => {
    const colors: Record<string, string> = {
      briefing: 'blue',
      questionnaire: 'green',
      condition: 'purple',
      block: 'orange',
      pause: 'yellow',
      end: 'emerald'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              <div className="w-px h-8 bg-border"></div>
              <div>
                <h1 className="text-lg font-bold">Procedure Builder</h1>
                <span className="text-xs text-muted-foreground">Conversational vs Traditional Search Study</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-secondary">
                Preview
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar - Available Components */}
          <div className="col-span-3">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-2">Components Library</h3>
              <p className="text-xs text-muted-foreground mb-6">
                Drag components to build your study flow
              </p>
              
              <div className="space-y-3">
                {availableComponents.map((component) => (
                  <div
                    key={component.type}
                    className={`bg-card border-2 border-${component.color}-500/30 rounded-xl p-4 cursor-move hover:border-${component.color}-500 transition-all hover:shadow-md`}
                    draggable
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-${component.color}-500/10 flex items-center justify-center text-${component.color}-500`}>
                        {getStepIcon(component.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{component.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-bold mb-4">Study Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Randomization</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress Indicator</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Save Progress</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Procedure Flow */}
          <div className="col-span-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Study Procedure</h2>
              <p className="text-muted-foreground">{procedureSteps.length} steps configured</p>
            </div>

            <div className="space-y-4">
              {procedureSteps.map((step, index) => (
                <div key={step.id}>
                  {/* Connection Line */}
                  {index > 0 && (
                    <div className="flex justify-center py-2">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}

                  {/* Step Card */}
                  <div
                    onClick={() => setSelectedStep(step.id)}
                    className={`bg-card rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedStep === step.id
                        ? `border-${getStepColor(step.type)}-500 shadow-lg`
                        : 'border-border hover:border-border/60'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 bg-${getStepColor(step.type)}-500/10 rounded-xl flex items-center justify-center text-${getStepColor(step.type)}-500 flex-shrink-0`}>
                            {getStepIcon(step.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">Step {index + 1}</span>
                              <h3 className="font-bold text-lg">{step.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{step.content}</p>
                            
                            {/* Show children for block type */}
                            {step.type === 'block' && step.children && (
                              <div className="mt-4 space-y-3">
                                {step.isCounterbalanced && (
                                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 text-xs font-semibold text-yellow-600 inline-flex items-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    <span>Counterbalanced</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                  {step.children.map((child: any) => (
                                    <div key={child.id} className="bg-secondary rounded-xl p-4 border border-border">
                                      <div className="flex items-start space-x-3">
                                        <div className={`w-8 h-8 rounded-lg bg-${getStepColor(child.type)}-500/10 flex items-center justify-center text-${getStepColor(child.type)}-500 flex-shrink-0`}>
                                          {getStepIcon(child.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-semibold mb-1">{child.title}</div>
                                          <div className="text-xs text-muted-foreground">{child.backend}</div>
                                          {child.duration && (
                                            <div className="text-xs text-muted-foreground mt-1">Est. {child.duration}</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button className="text-muted-foreground hover:text-red-500 p-2 rounded-lg hover:bg-secondary transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Step Button */}
              <div className="flex justify-center py-6">
                <button className="border-2 border-dashed border-border hover:border-blue-500 rounded-2xl px-8 py-4 text-sm text-muted-foreground hover:text-foreground transition-all flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Step</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Step Configuration */}
          <div className="col-span-3">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-4">
              {selectedStep ? (
                <>
                  <h3 className="text-lg font-bold mb-6">Configure Step</h3>
                  {(() => {
                    const step = procedureSteps.find(s => s.id === selectedStep);
                    if (!step) return null;
                    
                    return (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-3">Step Title</label>
                          <input
                            type="text"
                            defaultValue={step.title}
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {(step.type === 'briefing' || step.type === 'end') && (
                          <div>
                            <label className="block text-sm font-medium mb-3">Content</label>
                            <textarea
                              defaultValue={step.content}
                              rows={6}
                              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                          </div>
                        )}

                        {step.type === 'questionnaire' && (
                          <div>
                            <label className="block text-sm font-medium mb-3">Question Set</label>
                            <select className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                              <option>Demographics</option>
                              <option>NASA-TLX (Cognitive Load)</option>
                              <option>System Usability Scale (SUS)</option>
                              <option>User Satisfaction</option>
                              <option>Custom Questions</option>
                            </select>
                            <button className="mt-3 text-sm text-blue-500 hover:text-blue-600 font-medium">
                              + Customize Questions
                            </button>
                          </div>
                        )}

                        {step.type === 'condition' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-3">Backend System</label>
                              <select className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>OpenAI GPT-4 Turbo</option>
                                <option>Bing Search API</option>
                                <option>Tavily Agent API</option>
                                <option>Ollama Local LLM</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-3">Task Description</label>
                              <textarea
                                rows={4}
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Enter the task description participants will see..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-3">Time Limit (optional)</label>
                              <input
                                type="text"
                                placeholder="e.g., 15 minutes"
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </>
                        )}

                        {step.type === 'block' && (
                          <div>
                            <label className="flex items-center space-x-3 mb-4">
                              <input 
                                type="checkbox" 
                                defaultChecked={step.isCounterbalanced}
                                className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium">Enable Counterbalancing</span>
                            </label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Participants will be randomly assigned different orderings of conditions within this block (e.g., A-B vs B-A).
                            </p>
                          </div>
                        )}

                        <div className="pt-6 border-t border-border">
                          <label className="block text-sm font-medium mb-4">Step Options</label>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                defaultChecked
                                className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-muted-foreground">Required to complete</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-muted-foreground">Allow skip</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input 
                                type="checkbox" 
                                defaultChecked
                                className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-muted-foreground">Show in progress bar</span>
                            </label>
                          </div>
                        </div>

                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md">
                          Save Changes
                        </button>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a step from the procedure flow to configure its settings
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
