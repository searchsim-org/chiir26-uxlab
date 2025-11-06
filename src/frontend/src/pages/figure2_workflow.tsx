import React from 'react';

export default function Figure2Workflow() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          The UXLab Research Workflow
        </h1>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Researcher Responsibilities (Conceptual) */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-tint mb-2">
                Researcher Responsibilities
              </h2>
              <p className="text-muted-foreground">(Conceptual Tasks)</p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-card border-2 border-tint rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-tint text-tint-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Formulate Research Question</h3>
                    <p className="text-sm text-muted-foreground">
                      Define the hypothesis and experimental design
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-card border-2 border-tint rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-tint text-tint-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Prepare Backends</h3>
                    <p className="text-sm text-muted-foreground">
                      Procure API keys or ensure local endpoints are available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Automated by UXLab (Technical) */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-blue-500 mb-2">
                Automated by UXLab
              </h2>
              <p className="text-muted-foreground">(Technical Implementation)</p>
            </div>

            <div className="space-y-4">
              {/* Step 3 */}
              <div className="bg-card border-2 border-blue-500 rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Create Study in Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the web UI to create a new study
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-card border-2 border-blue-500 rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Configure Backends</h3>
                    <p className="text-sm text-muted-foreground">
                      Point UXLab to desired backends using dropdowns and text fields
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-card border-2 border-blue-500 rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Build Procedure</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag-and-drop interface to build the study flow
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-card border-2 border-blue-500 rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    6
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Deploy & Recruit</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive a single URL for distribution
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 7 */}
              <div className="bg-card border-2 border-blue-500 rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    7
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Monitor & Export Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time monitoring and one-click CSV export
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground italic">
            UXLab automates the technical scaffolding, allowing researchers to focus on conceptual design
          </p>
        </div>
      </div>
    </div>
  );
}

