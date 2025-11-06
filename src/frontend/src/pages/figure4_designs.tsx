import React from 'react';

export default function Figure4Designs() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          Typical Study Designs in UXLab
        </h1>

        <div className="space-y-16">
          
          {/* A. Between-Subject Design */}
          <div className="bg-card rounded-xl p-8 shadow-xl border-2 border-border">
            <h2 className="text-2xl font-bold mb-6 text-blue-500">
              A. Between-Subject Design
            </h2>
            <p className="text-muted-foreground mb-8">
              Different groups of participants experience different conditions
            </p>

            <div className="grid grid-cols-2 gap-8">
              {/* Group 1 */}
              <div className="space-y-4">
                <div className="bg-tint text-tint-foreground p-4 rounded-lg text-center font-bold">
                  Group 1
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Pre-Task Questionnaire
                  </div>
                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>
                  <div className="bg-green-500 text-white p-6 rounded-lg text-center font-semibold">
                    Prototype A<br/>
                    <span className="text-sm font-normal">(Traditional SERP)</span>
                  </div>
                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Post-Task Questionnaire
                  </div>
                </div>
              </div>

              {/* Group 2 */}
              <div className="space-y-4">
                <div className="bg-tint text-tint-foreground p-4 rounded-lg text-center font-bold">
                  Group 2
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Pre-Task Questionnaire
                  </div>
                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>
                  <div className="bg-purple-500 text-white p-6 rounded-lg text-center font-semibold">
                    Prototype B<br/>
                    <span className="text-sm font-normal">(Agentic Interface)</span>
                  </div>
                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Post-Task Questionnaire
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B. Within-Subject Design */}
          <div className="bg-card rounded-xl p-8 shadow-xl border-2 border-border">
            <h2 className="text-2xl font-bold mb-6 text-purple-500">
              B. Within-Subject Design (Counterbalanced)
            </h2>
            <p className="text-muted-foreground mb-8">
              Each participant experiences all conditions in randomized order
            </p>

            <div className="flex justify-center">
              <div className="w-2/3 space-y-4">
                <div className="bg-tint text-tint-foreground p-4 rounded-lg text-center font-bold">
                  All Participants
                </div>
                
                <div className="flex flex-col space-y-3">
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Pre-Study Questionnaire
                  </div>
                  
                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>

                  {/* Counterbalanced Block */}
                  <div className="border-4 border-dashed border-yellow-500 rounded-xl p-6 bg-yellow-500/5">
                    <div className="text-center mb-4">
                      <span className="bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                        ⚡ COUNTERBALANCED BLOCK
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <div className="text-center font-semibold text-sm mb-2">Order A-B (50%)</div>
                        <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
                          Prototype A (RAG)
                        </div>
                        <div className="h-4 flex justify-center">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
                          Prototype B (Agentic)
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-center font-semibold text-sm mb-2">Order B-A (50%)</div>
                        <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
                          Prototype B (Agentic)
                        </div>
                        <div className="h-4 flex justify-center">
                          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
                          Prototype A (RAG)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>
                  
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Post-Study Questionnaire
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C. Interrupted Time-Series Design */}
          <div className="bg-card rounded-xl p-8 shadow-xl border-2 border-border">
            <h2 className="text-2xl font-bold mb-6 text-orange-500">
              C. Interrupted Time-Series / Longitudinal Design
            </h2>
            <p className="text-muted-foreground mb-8">
              Study behavior changes over time with interventions between sessions
            </p>

            <div className="flex justify-center">
              <div className="w-2/3 space-y-4">
                <div className="bg-tint text-tint-foreground p-4 rounded-lg text-center font-bold">
                  Participants (Longitudinal)
                </div>
                
                <div className="flex flex-col space-y-3">
                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Initial Session - Day 1
                  </div>
                  
                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>

                  <div className="bg-green-500 text-white p-6 rounded-lg text-center font-semibold">
                    Prototype A<br/>
                    <span className="text-sm font-normal">(Baseline Data Collection)</span>
                  </div>

                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>

                  {/* Pause Element */}
                  <div className="border-4 border-dashed border-orange-500 rounded-xl p-6 bg-orange-500/5">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⏸️</div>
                      <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                        PAUSE ELEMENT
                      </span>
                      <p className="text-sm mt-3 text-muted-foreground">
                        Wait 3 days or until experimenter approval<br/>
                        <span className="text-xs italic">(e.g., model personalization, intervention)</span>
                      </p>
                    </div>
                  </div>

                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>

                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Follow-up Session - Day 4+
                  </div>

                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>
                  
                  <div className="bg-blue-500 text-white p-6 rounded-lg text-center font-semibold">
                    Prototype A<br/>
                    <span className="text-sm font-normal">(Personalized/Modified Version)</span>
                  </div>

                  <div className="h-8 flex justify-center">
                    <div className="w-1 bg-muted-foreground"></div>
                  </div>

                  <div className="bg-secondary p-4 rounded-lg text-center">
                    Post-Study Questionnaire
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            UXLab Dashboard provides built-in support for common experimental designs
          </p>
        </div>
      </div>
    </div>
  );
}

