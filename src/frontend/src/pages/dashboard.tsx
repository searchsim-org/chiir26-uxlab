import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function ExperimenterDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('studies');

  // Mock data for studies
  const mockStudies = [
    {
      id: 1,
      name: 'Conversational vs Traditional Search: User Preference Study',
      status: 'active',
      participants: 47,
      targetParticipants: 60,
      created: 'October 15, 2024',
      lastModified: '2 hours ago',
      design: 'Within-Subject',
      conditions: ['GPT-4 RAG', 'Bing Search'],
      avgSessionTime: '12m 34s',
      completionRate: 92
    },
    {
      id: 2,
      name: 'Agentic Systems for Complex Information Tasks',
      status: 'active',
      participants: 28,
      targetParticipants: 40,
      created: 'October 22, 2024',
      lastModified: '1 day ago',
      design: 'Between-Subject',
      conditions: ['Tavily Agent', 'Control'],
      avgSessionTime: '18m 42s',
      completionRate: 88
    },
    {
      id: 3,
      name: 'Longitudinal Study: Search Behavior Adaptation',
      status: 'draft',
      participants: 0,
      targetParticipants: 100,
      created: 'October 28, 2024',
      lastModified: '3 hours ago',
      design: 'Time-Series',
      conditions: ['Baseline', 'Personalized'],
      avgSessionTime: '—',
      completionRate: 0
    },
    {
      id: 4,
      name: 'Information Credibility Assessment Study',
      status: 'completed',
      participants: 64,
      targetParticipants: 64,
      created: 'September 5, 2024',
      lastModified: 'October 12, 2024',
      design: 'Within-Subject',
      conditions: ['Source Attribution', 'No Attribution'],
      avgSessionTime: '15m 18s',
      completionRate: 96
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* <span className="text-md font-bold text-muted-foreground">Experimenter Dashboard</span> */}
              <img
            src="/logo-black.png"
            alt="Logo"
            className="w-[120px] mt-0 ml-5"
          />
            </div>
            <div className="flex items-center space-x-6">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">SZ</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Saber Zerhoudi</span>
                  <span className="text-xs text-muted-foreground">University of Passau</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-12 border-b border-border">
          <button
            onClick={() => setActiveTab('studies')}
            className={`py-4 px-6 text-lg font-bold transition-all relative ${
              activeTab === 'studies'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Studies
            {activeTab === 'studies' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('backends')}
            className={`py-4 px-6 text-sm font-medium transition-all relative ${
              activeTab === 'backends'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Backend Configuration
            {activeTab === 'backends' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-4 px-6 text-sm font-medium transition-all relative ${
              activeTab === 'participants'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Participants
            {activeTab === 'participants' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-6 text-sm font-medium transition-all relative ${
              activeTab === 'analytics'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analytics & Export
            {activeTab === 'analytics' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            )}
          </button>
        </div>

        {/* Studies Tab Content */}
        {activeTab === 'studies' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">My Studies</h2>
                <p className="text-muted-foreground">Manage and monitor your experimental studies</p>
              </div>
              <button 
                onClick={() => router.push('/dashboard/new-study')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Create New Study
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-card rounded-2xl p-6 border border-border hover:border-blue-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-muted-foreground">Total Studies</div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold tracking-tight">4</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border hover:border-green-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-muted-foreground">Active Studies</div>
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold tracking-tight">2</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-muted-foreground">Total Participants</div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold tracking-tight">139</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border hover:border-orange-500/50 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold tracking-tight">91%</div>
              </div>
            </div>

            {/* Studies List */}
            <div className="space-y-6">
              {mockStudies.map((study) => (
                <div
                  key={study.id}
                  className="bg-card rounded-2xl border border-border hover:border-blue-500/30 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-2xl font-bold tracking-tight">{study.name}</h3>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                            study.status === 'active'
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                              : study.status === 'draft'
                              ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                              : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          }`}>
                            {study.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Created {study.created}</span>
                          <span>•</span>
                          <span>Updated {study.lastModified}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Participants</div>
                        <div className="text-2xl font-bold tracking-tight">
                          {study.participants}<span className="text-lg text-muted-foreground">/{study.targetParticipants}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Design</div>
                        <div className="text-sm font-medium">{study.design}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Avg Session</div>
                        <div className="text-sm font-medium">{study.avgSessionTime}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Completion</div>
                        <div className="text-sm font-medium">{study.completionRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Conditions</div>
                        <div className="flex flex-wrap gap-1.5">
                          {study.conditions.map((cond, idx) => (
                            <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded-md font-medium">
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Progress</span>
                        <span className="text-xs font-semibold">{Math.round((study.participants / study.targetParticipants) * 100)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(study.participants / study.targetParticipants) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => router.push(`/dashboard/study/${study.id}`)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
                      >
                        View Details
                      </button>
                      <button className="flex-1 bg-secondary hover:bg-accent text-foreground py-3 rounded-xl text-sm font-medium transition-all border border-border">
                        Edit Configuration
                      </button>
                      <button className="px-6 bg-secondary hover:bg-accent text-foreground py-3 rounded-xl text-sm font-medium transition-all border border-border">
                        Export Data
                      </button>
                      <button className="px-6 bg-secondary hover:bg-accent text-foreground py-3 rounded-xl text-sm font-medium transition-all border border-border">
                        Share Link
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backend Configuration Tab */}
        {activeTab === 'backends' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">Backend Configuration</h2>
                <p className="text-muted-foreground">Configure search engines, RAG systems, and agentic backends</p>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                Add New Backend
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* OpenAI Backend */}
              <div className="bg-card rounded-2xl border border-border hover:border-green-500/30 hover:shadow-lg transition-all p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-2">OpenAI GPT-4 Turbo</h3>
                      <span className="text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full font-semibold border border-green-500/20">CONNECTED</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Backend Type</span>
                    <span className="font-medium">Conversational RAG</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Model Version</span>
                    <span className="font-medium font-mono text-xs">gpt-4-0125-preview</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">API Key</span>
                    <span className="font-mono text-xs">sk-proj-***************3x9K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Health Check</span>
                    <span className="text-green-600 font-medium text-xs">2 minutes ago</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Used in Studies</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-medium">Conversational vs Traditional</span>
                    <span className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-medium">Credibility Assessment</span>
                  </div>
                </div>
              </div>

              {/* Bing Search Backend */}
              <div className="bg-card rounded-2xl border border-border hover:border-blue-500/30 hover:shadow-lg transition-all p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-2">Bing Search API</h3>
                      <span className="text-xs bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full font-semibold border border-blue-500/20">CONNECTED</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Backend Type</span>
                    <span className="font-medium">Traditional Search</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">API Version</span>
                    <span className="font-medium font-mono text-xs">v7.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">API Key</span>
                    <span className="font-mono text-xs">*********************k2mQ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Health Check</span>
                    <span className="text-green-600 font-medium text-xs">5 minutes ago</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Used in Studies</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-medium">Conversational vs Traditional</span>
                  </div>
                </div>
              </div>

              {/* Tavily Agent Backend */}
              <div className="bg-card rounded-2xl border border-border hover:border-purple-500/30 hover:shadow-lg transition-all p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-2">Tavily Agent API</h3>
                      <span className="text-xs bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full font-semibold border border-purple-500/20">CONNECTED</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Backend Type</span>
                    <span className="font-medium">Agentic Search</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Search Depth</span>
                    <span className="font-medium">Advanced</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">API Key</span>
                    <span className="font-mono text-xs">tvly-***************8a3F</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Health Check</span>
                    <span className="text-green-600 font-medium text-xs">1 minute ago</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Used in Studies</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-medium">Agentic Systems Study</span>
                  </div>
                </div>
              </div>

              {/* Ollama Local Backend */}
              <div className="bg-card rounded-2xl border border-border hover:border-orange-500/30 hover:shadow-lg transition-all p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight mb-2">Ollama Local LLM</h3>
                      <span className="text-xs bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full font-semibold border border-orange-500/20">RUNNING</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Backend Type</span>
                    <span className="font-medium">Local LLM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium font-mono text-xs">llama3.1:70b</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Endpoint</span>
                    <span className="font-mono text-xs">http://localhost:11434</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Health Check</span>
                    <span className="text-green-600 font-medium text-xs">30 seconds ago</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Used in Studies</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">Not currently in use</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-8">Participant Management</h2>
            
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h3 className="text-xl font-bold mb-6">Platform Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Prolific Integration</label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Enter Prolific API Key"
                      className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all">
                      Connect
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Amazon MTurk Integration</label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Enter MTurk API Key"
                      className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold">Active Participants</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Participant ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Study Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { id: 'P047', study: 'Conversational vs Traditional', status: 'completed', started: 'Oct 28, 14:23', progress: 100 },
                      { id: 'P048', study: 'Conversational vs Traditional', status: 'in-progress', started: 'Oct 28, 15:10', progress: 67 },
                      { id: 'P028', study: 'Agentic Systems Study', status: 'completed', started: 'Oct 28, 09:15', progress: 100 },
                      { id: 'P029', study: 'Agentic Systems Study', status: 'in-progress', started: 'Oct 28, 16:42', progress: 33 },
                      { id: 'P064', study: 'Credibility Assessment', status: 'completed', started: 'Oct 12, 11:30', progress: 100 },
                    ].map((participant) => (
                      <tr key={participant.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold font-mono">
                          {participant.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {participant.study}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            participant.status === 'completed'
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                          }`}>
                            {participant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {participant.started}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-secondary rounded-full h-2 max-w-xs">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${participant.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold w-12 text-right">
                              {participant.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-8">Analytics & Data Export</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-2">4,892</div>
                <div className="text-sm text-muted-foreground">Total Queries</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-2">14m 28s</div>
                <div className="text-sm text-muted-foreground">Avg Session Duration</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-2">91%</div>
                <div className="text-sm text-muted-foreground">Task Completion Rate</div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Export Study Data</h3>
              <p className="text-muted-foreground mb-8">
                Download complete datasets including interaction logs, questionnaire responses, and session metadata for offline analysis
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-secondary rounded-xl hover:bg-accent transition-colors">
                  <div>
                    <div className="font-semibold text-lg mb-1">Conversational vs Traditional Search Study</div>
                    <div className="text-sm text-muted-foreground">
                      47 participants • 2,341 interactions • Last updated: 2 hours ago
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
                    Download CSV
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-secondary rounded-xl hover:bg-accent transition-colors">
                  <div>
                    <div className="font-semibold text-lg mb-1">Agentic Systems for Complex Tasks</div>
                    <div className="text-sm text-muted-foreground">
                      28 participants • 1,547 interactions • Last updated: 1 day ago
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
                    Download CSV
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-secondary rounded-xl hover:bg-accent transition-colors">
                  <div>
                    <div className="font-semibold text-lg mb-1">Information Credibility Assessment Study</div>
                    <div className="text-sm text-muted-foreground">
                      64 participants • 3,891 interactions • Completed: October 12, 2024
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md">
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
