import React, { useState } from 'react';

export default function ParticipantView() {
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 6;
  const [taskComplete, setTaskComplete] = useState(false);

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Study Navigator - Top Persistent Frame */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Study Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Task Description */}
          <div className="bg-secondary/50 rounded-xl p-6 mb-6 border border-border">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-xl mb-3">
                  Task: Information Seeking about Dulles International Airport
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You need to find comprehensive information about Washington Dulles International Airport, including: its location (city and state), available transportation options (shuttles, ride-sharing, taxis), nearby hotel accommodations, affordable off-airport parking facilities, and metro station accessibility.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-purple-600">Condition: GPT-4 RAG System</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Time elapsed: 3m 42s</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setTaskComplete(!taskComplete)}
                className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${
                  taskComplete 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-secondary text-foreground hover:bg-accent border border-border'
                }`}
              >
                {taskComplete ? 'Task Marked Complete' : 'Mark Task as Complete'}
              </button>
              <button 
                disabled={!taskComplete}
                className={`px-8 py-3 rounded-full font-medium text-sm transition-all flex items-center space-x-2 ${
                  taskComplete
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl cursor-pointer'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                }`}
              >
                <span>Continue to Next Step</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Window - Conversational RAG Interface */}
      <div className="flex-1 bg-background p-6 overflow-auto">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          
          {/* Conversation Display */}
          <div className="flex-1 space-y-6 mb-6">
            
            {/* User Message 1 */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm p-5 max-w-[75%] shadow-sm">
                <p className="text-sm leading-relaxed">
                  Where is Dulles airport located and what transportation options are available to get there?
                </p>
              </div>
            </div>

            {/* Assistant Response 1 */}
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-6 max-w-[85%] shadow-sm">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed mb-4">
                      Washington Dulles International Airport (IAD) is located in <strong>Dulles, Virginia</strong>, approximately 26 miles west of downtown Washington, D.C. The airport serves the greater Washington metropolitan area and offers multiple transportation options:
                    </p>
                    
                    <div className="space-y-3 text-sm mb-4">
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <strong className="text-blue-500">Metro Silver Line</strong>
                        <p className="text-muted-foreground mt-1">Direct rail connection to Washington D.C. The airport station connects to the main terminal via the AeroTrain system. Travel time to downtown is approximately 60 minutes.</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <strong className="text-blue-500">Taxi & Rideshare Services</strong>
                        <p className="text-muted-foreground mt-1">Taxis are available 24/7 at designated areas. Uber and Lyft have dedicated pickup locations on the Arrivals level. Typical fare to downtown D.C. ranges from $65-80.</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <strong className="text-blue-500">Airport Shuttles & Buses</strong>
                        <p className="text-muted-foreground mt-1">Multiple shuttle services including SuperShuttle, GO Airport Shuttle, and the Washington Flyer Silver Line Express bus offer shared and private transportation options.</p>
                      </div>
                    </div>

                    {/* Source Citations */}
                    <div className="pt-4 border-t border-border">
                      <div className="text-xs font-semibold mb-3 text-muted-foreground flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors">
                          flydulles.com
                        </button>
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors">
                          wmata.com
                        </button>
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors">
                          transportation.gov
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Message 2 */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm p-5 max-w-[75%] shadow-sm">
                <p className="text-sm leading-relaxed">
                  What hotels are nearby and what are the parking options?
                </p>
              </div>
            </div>

            {/* Assistant Response 2 */}
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-6 max-w-[85%] shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed mb-4">
                      There are several convenient hotel options near Dulles Airport, and multiple parking facilities for different needs:
                    </p>
                    
                    <div className="space-y-4 text-sm mb-4">
                      <div>
                        <h4 className="font-semibold mb-3">Nearby Hotels:</h4>
                        <div className="space-y-3">
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <strong>Hyatt Regency Dulles</strong>
                              <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full font-semibold">On-site</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Connected to terminal via skybridge. Starting at $199/night.</p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <strong>Washington Dulles Airport Marriott</strong>
                              <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full font-semibold">0.3 mi</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Free AeroTrain access. Starting at $189/night.</p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <strong>Hilton Washington Dulles Airport</strong>
                              <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full font-semibold">0.5 mi</span>
                            </div>
                            <p className="text-xs text-muted-foreground">24-hour shuttle service. Starting at $165/night.</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Parking Options:</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-secondary/50 rounded-lg p-3">
                            <span>Terminal Parking (Garage)</span>
                            <span className="text-xs font-semibold">$17/hour, $35/day</span>
                          </div>
                          <div className="flex justify-between items-center bg-secondary/50 rounded-lg p-3">
                            <span>Economy Parking</span>
                            <span className="text-xs font-semibold">$10/day</span>
                          </div>
                          <div className="flex justify-between items-center bg-secondary/50 rounded-lg p-3">
                            <span>Off-Airport (Private Lots)</span>
                            <span className="text-xs font-semibold">$7-12/day</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Source Citations */}
                    <div className="pt-4 border-t border-border">
                      <div className="text-xs font-semibold mb-3 text-muted-foreground flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors">
                          booking.com
                        </button>
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors">
                          hotels.com
                        </button>
                        <button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 transition-colors">
                          flydulles.com/parking
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Input Area */}
          <div className="sticky bottom-0 bg-background pt-4 pb-2">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Ask a follow-up question..."
                className="flex-1 bg-card border-2 border-border focus:border-blue-500 rounded-2xl px-6 py-4 text-sm outline-none transition-all"
              />
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-2xl transition-all shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Continue asking questions until you have enough information to complete the task
            </p>
          </div>

        </div>
      </div>

      {/* System Info Bar */}
      <div className="bg-card border-t border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Study ID: CONV-TRAD-2024</span>
              <span>•</span>
              <span>Participant: P047</span>
              <span>•</span>
              <span className="text-green-600">Session Active</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Backend: OpenAI GPT-4 Turbo</span>
              <span>•</span>
              <span>Interactions: 14</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
