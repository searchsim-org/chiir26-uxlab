import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  getStudies, getBackends, getGlobalStats, downloadStudyCSV,
  deleteStudy, duplicateStudy, activateStudy, pauseStudy,
  createBackend, deleteBackend, testBackend, getConnectorSchemas,
  getParticipants, exportStudyConfig, importStudyConfig,
  Study, Backend, GlobalStats
} from '../services/studyService';

import { useAuth } from '@/contexts/AuthContext';

const GITHUB_REPO_URL = 'https://github.com/uxlab-org/uxlab';

export default function ExperimenterDashboard() {
  const router = useRouter();
  const { authenticated, loading: authLoading, user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('studies');

  // Auth protection
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, authenticated, router]);

  // Real data state
  const [studies, setStudies] = useState<Study[]>([]);
  const [backends, setBackends] = useState<Backend[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Backend Modal state
  const [showAddBackendModal, setShowAddBackendModal] = useState(false);
  const [connectorSchemas, setConnectorSchemas] = useState<Record<string, any>>({});
  const [newBackendForm, setNewBackendForm] = useState({
    name: '',
    connector_type: '',
    config: {} as Record<string, any>,
  });
  const [creatingBackend, setCreatingBackend] = useState(false);

  // Participants state
  const [participants, setParticipants] = useState<{studyName: string; data: any}[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [selectedStudyFilter, setSelectedStudyFilter] = useState<number | null>(null);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [studiesRes, backendsRes, statsRes] = await Promise.all([
          getStudies(),
          getBackends(),
          getGlobalStats()
        ]);
        setStudies(studiesRes.studies);
        setBackends(backendsRes.backends);
        setGlobalStats(statsRes);
        setError(null);
        try {
          const schemas = await getConnectorSchemas();
          setConnectorSchemas(schemas);
        } catch (e) {
          console.error('Failed to fetch connector schemas:', e);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. The backend may not be running.');
        // Use fallback mock data if API fails
        setStudies([]);
        setBackends([]);
        setGlobalStats({
          total_studies: 0,
          active_studies: 0,
          draft_studies: 0,
          completed_studies: 0,
          total_participants: 0,
          completed_participants: 0,
          overall_completion_rate: 0,
          total_interactions: 0
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'participants' || studies.length === 0) return;

    async function fetchParticipants() {
      setParticipantsLoading(true);
      try {
        const allParticipants: {studyName: string; data: any}[] = [];
        const targetStudies = selectedStudyFilter
          ? studies.filter(s => s.id === selectedStudyFilter)
          : studies;

        for (const study of targetStudies) {
          try {
            const res = await getParticipants(study.id);
            for (const p of res.participants) {
              allParticipants.push({ studyName: study.name, data: p });
            }
          } catch {
            // Skip studies that fail
          }
        }
        setParticipants(allParticipants);
      } catch {
        setParticipants([]);
      } finally {
        setParticipantsLoading(false);
      }
    }
    fetchParticipants();
  }, [activeTab, studies, selectedStudyFilter]);

  // Action handlers
  const handleDeleteStudy = async (id: number) => {
    if (!confirm('Are you sure you want to delete this study?')) return;
    try {
      await deleteStudy(id);
      setStudies(studies.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete study');
    }
  };

  const handleDuplicateStudy = async (id: number) => {
    try {
      const newStudy = await duplicateStudy(id);
      setStudies([newStudy, ...studies]);
    } catch (err) {
      alert('Failed to duplicate study');
    }
  };

  const handleActivateStudy = async (id: number) => {
    try {
      await activateStudy(id);
      setStudies(studies.map(s => s.id === id ? { ...s, status: 'active' } : s));
    } catch (err) {
      alert('Failed to activate study');
    }
  };

  const handlePauseStudy = async (id: number) => {
    try {
      await pauseStudy(id);
      setStudies(studies.map(s => s.id === id ? { ...s, status: 'paused' } : s));
    } catch (err) {
      alert('Failed to pause study');
    }
  };

  const handleDownloadCSV = async (id: number) => {
    try {
      await downloadStudyCSV(id);
    } catch (err) {
      alert('Failed to download CSV');
    }
  };

  const handleExportJSON = async (id: number, name: string) => {
    try {
      const config = await exportStudyConfig(id);
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_config.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export study configuration');
    }
  };

  const handleImportJSON = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const config = JSON.parse(text);
        await importStudyConfig(config);
        const refreshed = await getStudies();
        setStudies(refreshed.studies);
        alert('Study imported successfully!');
      } catch {
        alert('Failed to import study. Make sure the file is a valid UXLab JSON export.');
      }
    };
    input.click();
  };

  const handleDeleteBackend = async (id: number) => {
    if (!confirm('Are you sure you want to delete this backend?')) return;
    try {
      await deleteBackend(id);
      setBackends(backends.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to delete backend');
    }
  };

  const handleTestBackend = async (id: number) => {
    try {
      const result = await testBackend(id);
      setBackends(backends.map(b =>
        b.id === id ? { ...b, health_status: result.status, last_health_check: result.checked_at } : b
      ));
      alert(`Health check: ${result.status} - ${result.message}`);
    } catch (err) {
      alert('Failed to test backend');
    }
  };

  // Helper to format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateStr);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentation
              </a>
              <div className="relative">
                {authenticated && user && (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name || user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-semibold">
                            {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">{user.name || user.username}</span>
                        {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                      </div>
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                          <a
                            href={GITHUB_REPO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Documentation</span>
                          </a>
                          <div className="border-t border-border my-1" />
                          <button
                            onClick={async () => {
                              setShowUserMenu(false);
                              await signOut();
                              router.push('/auth/login');
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-secondary transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
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
            className={`py-4 px-6 text-lg font-bold transition-all relative ${activeTab === 'studies'
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
            className={`py-4 px-6 text-sm font-medium transition-all relative ${activeTab === 'backends'
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
            className={`py-4 px-6 text-sm font-medium transition-all relative ${activeTab === 'participants'
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
            className={`py-4 px-6 text-sm font-medium transition-all relative ${activeTab === 'analytics'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Analytics & Export
            {activeTab === 'analytics' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            )}
          </button>
        </div >

        {/* Studies Tab Content */}
        {
          activeTab === 'studies' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight mb-2">My Studies</h2>
                  <p className="text-muted-foreground">Manage and monitor your experimental studies</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleImportJSON}
                    className="px-6 py-3 rounded-full font-medium transition-all border border-border bg-secondary hover:bg-accent text-foreground"
                  >
                    Import Study
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/new-study')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    Create New Study
                  </button>
                </div>
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
                  <div className="text-4xl font-bold tracking-tight">{globalStats?.total_studies || 0}</div>
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
                  <div className="text-4xl font-bold tracking-tight">{globalStats?.active_studies || 0}</div>
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
                  <div className="text-4xl font-bold tracking-tight">{globalStats?.total_participants || 0}</div>
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
                  <div className="text-4xl font-bold tracking-tight">{globalStats?.overall_completion_rate?.toFixed(0) || 0}%</div>
                </div>
              </div>

              {/* Studies List */}
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading studies...</div>
                ) : studies.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No studies yet. Create your first study to get started.</p>
                    <button
                      onClick={() => router.push('/dashboard/new-study')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full"
                    >
                      Create New Study
                    </button>
                  </div>
                ) : studies.map((study: Study) => (
                  <div
                    key={study.id}
                    className="bg-card rounded-2xl border border-border hover:border-blue-500/30 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-2xl font-bold tracking-tight">{study.name}</h3>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${study.status === 'active'
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                              : study.status === 'draft'
                                ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                                : study.status === 'paused'
                                  ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                                  : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              }`}>
                              {study.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Created {formatDate(study.created_at)}</span>
                            <span>•</span>
                            <span>Updated {formatRelativeTime(study.updated_at)}</span>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex space-x-2">
                          {study.status === 'draft' && (
                            <button onClick={() => handleActivateStudy(study.id)} className="text-green-500 hover:text-green-600 text-sm">
                              Activate
                            </button>
                          )}
                          {study.status === 'active' && (
                            <button onClick={() => handlePauseStudy(study.id)} className="text-orange-500 hover:text-orange-600 text-sm">
                              Pause
                            </button>
                          )}
                          <button onClick={() => handleDuplicateStudy(study.id)} className="text-blue-500 hover:text-blue-600 text-sm">
                            Duplicate
                          </button>
                          <button onClick={() => handleDeleteStudy(study.id)} className="text-red-500 hover:text-red-600 text-sm">
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Participants</div>
                          <div className="text-2xl font-bold tracking-tight">
                            {study.participant_count}<span className="text-lg text-muted-foreground">/{study.target_participants}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Design</div>
                          <div className="text-sm font-medium">{study.design_type}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Completion</div>
                          <div className="text-sm font-medium">{study.completion_rate.toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Description</div>
                          <div className="text-sm text-muted-foreground truncate">{study.description || 'No description'}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Progress</span>
                          <span className="text-xs font-semibold">{study.target_participants > 0 ? Math.round((study.participant_count / study.target_participants) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${study.target_participants > 0 ? (study.participant_count / study.target_participants) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => router.push(`/dashboard/procedure-builder?study_id=${study.id}`)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          Edit Procedure
                        </button>
                        <button
                          onClick={() => handleDownloadCSV(study.id)}
                          className="px-6 bg-secondary hover:bg-accent text-foreground py-3 rounded-xl text-sm font-medium transition-all border border-border"
                        >
                          Export Data
                        </button>
                        <button
                          onClick={() => handleExportJSON(study.id, study.name)}
                          className="px-6 bg-secondary hover:bg-accent text-foreground py-3 rounded-xl text-sm font-medium transition-all border border-border"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/?study_id=${study.id}`;
                            navigator.clipboard.writeText(url);
                            alert('Study link copied to clipboard!');
                          }}
                          className="px-6 bg-secondary hover:bg-accent text-foreground py-3 rounded-xl text-sm font-medium transition-all border border-border"
                        >
                          Share Link
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* Backend Configuration Tab */}
        {
          activeTab === 'backends' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight mb-2">Backend Configuration</h2>
                  <p className="text-muted-foreground">Configure search engines, RAG systems, and agentic backends</p>
                </div>
                <button onClick={() => setShowAddBackendModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl">
                  Add New Backend
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {backends.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-muted-foreground mb-4">No backends configured yet.</p>
                    <button onClick={() => setShowAddBackendModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full">
                      Add Your First Backend
                    </button>
                  </div>
                ) : backends.map((backend: Backend) => (
                  <div key={backend.id} className="bg-card rounded-2xl border border-border hover:border-green-500/30 hover:shadow-lg transition-all p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${backend.connector_type.includes('openai') ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                          backend.connector_type.includes('bing') ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            backend.connector_type.includes('ollama') ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                              backend.connector_type.includes('tavily') ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                                'bg-gradient-to-br from-gray-500 to-gray-600'
                          }`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight mb-2">{backend.name}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${backend.health_status === 'healthy'
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : backend.health_status === 'unhealthy'
                              ? 'bg-red-500/10 text-red-600 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                            }`}>
                            {backend.health_status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestBackend(backend.id)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => handleDeleteBackend(backend.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Connector Type</span>
                        <span className="font-medium">{backend.connector_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Health Check</span>
                        <span className="text-muted-foreground text-xs">
                          {backend.last_health_check ? formatRelativeTime(backend.last_health_check) : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          )
        }

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-8">Participant Management</h2>

            {/* Study filter */}
            <div className="mb-6">
              <select
                value={selectedStudyFilter || ''}
                onChange={(e) => setSelectedStudyFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Studies</option>
                {studies.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-bold">
                  Participants {participants.length > 0 && `(${participants.length})`}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Participant ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Study</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Started</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {participantsLoading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading participants...</td></tr>
                    ) : participants.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No participants yet.</td></tr>
                    ) : participants.map((p) => (
                      <tr key={p.data.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold font-mono">{p.data.external_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{p.studyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            p.data.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                            p.data.status === 'active' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-600 border border-red-500/20'
                          }`}>
                            {p.data.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(p.data.started_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-secondary rounded-full h-2 max-w-xs">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${p.data.status === 'completed' ? 100 : 50}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold w-12 text-right">
                              {p.data.status === 'completed' ? '100%' : `Step ${p.data.current_step}`}
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
                <div className="text-3xl font-bold tracking-tight mb-2">{globalStats?.total_interactions?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Total Interactions</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-2">{globalStats?.total_participants || 0}</div>
                <div className="text-sm text-muted-foreground">Total Participants</div>
              </div>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-2">{globalStats?.overall_completion_rate?.toFixed(0) || 0}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Export Study Data</h3>
              <p className="text-muted-foreground mb-8">
                Download complete datasets including interaction logs, questionnaire responses, and session metadata for offline analysis
              </p>

              <div className="space-y-4">
                {studies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No studies to export.</p>
                ) : studies.map((study) => (
                  <div key={study.id} className="flex items-center justify-between p-6 bg-secondary rounded-xl hover:bg-accent transition-colors">
                    <div>
                      <div className="font-semibold text-lg mb-1">{study.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {study.participant_count} participants • Updated {formatRelativeTime(study.updated_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadCSV(study.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      Download CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div >

      {/* Add Backend Modal */}
      {showAddBackendModal && (() => {
        const connectorInfo: Record<string, { label: string; description: string; category: 'llm' | 'search'; icon: string }> = {
          openai: { label: 'OpenAI GPT', description: 'GPT models with RAG-powered search for grounded, cited responses', category: 'llm', icon: '🤖' },
          openai_agentic: { label: 'OpenAI Agentic', description: 'Autonomous multi-step search agent that plans and synthesizes from multiple sources', category: 'llm', icon: '🧠' },
          ollama: { label: 'Ollama (Local)', description: 'Privacy-preserving local LLM inference — supports Llama 3, Mistral, Gemma', category: 'llm', icon: '🏠' },
          groq: { label: 'Groq', description: 'Ultra-fast inference with Llama and Mixtral models via Groq Cloud', category: 'llm', icon: '⚡' },
          tavily: { label: 'Tavily Search', description: 'AI-optimized web search with content extraction and summaries', category: 'search', icon: '🔍' },
          bing: { label: 'Bing Search', description: 'Microsoft Bing Web Search API for traditional SERP-style results', category: 'search', icon: '🌐' },
          custom: { label: 'Custom Endpoint', description: 'Connect any REST API endpoint as a backend', category: 'search', icon: '🔧' },
        };
        const llmTypes = Object.keys(connectorSchemas).filter(t => connectorInfo[t]?.category === 'llm');
        const searchTypes = Object.keys(connectorSchemas).filter(t => connectorInfo[t]?.category === 'search');
        const otherTypes = Object.keys(connectorSchemas).filter(t => !connectorInfo[t]);

        return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Backend</h2>
                <button
                  onClick={() => { setShowAddBackendModal(false); setNewBackendForm({ name: '', connector_type: '', config: {} }); }}
                  className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Connector Type Cards */}
                <div>
                  <label className="block text-sm font-medium mb-3">Choose a Connector Type</label>

                  {llmTypes.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LLM / Conversational</span>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {llmTypes.map((type) => {
                          const info = connectorInfo[type];
                          const selected = newBackendForm.connector_type === type;
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                const defaults = connectorSchemas[type]?.defaults || {};
                                setNewBackendForm({ ...newBackendForm, connector_type: type, config: { ...defaults } });
                              }}
                              className={`text-left p-4 rounded-xl border-2 transition-all ${
                                selected
                                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                                  : 'border-border hover:border-blue-300 hover:bg-secondary/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{info?.icon || '📦'}</span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm">{info?.label || type}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{info?.description}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {searchTypes.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Engines</span>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {searchTypes.map((type) => {
                          const info = connectorInfo[type];
                          const selected = newBackendForm.connector_type === type;
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                const defaults = connectorSchemas[type]?.defaults || {};
                                setNewBackendForm({ ...newBackendForm, connector_type: type, config: { ...defaults } });
                              }}
                              className={`text-left p-4 rounded-xl border-2 transition-all ${
                                selected
                                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                                  : 'border-border hover:border-blue-300 hover:bg-secondary/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{info?.icon || '📦'}</span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm">{info?.label || type}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{info?.description}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {otherTypes.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other</span>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {otherTypes.map((type) => {
                          const selected = newBackendForm.connector_type === type;
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                const defaults = connectorSchemas[type]?.defaults || {};
                                setNewBackendForm({ ...newBackendForm, connector_type: type, config: { ...defaults } });
                              }}
                              className={`text-left p-4 rounded-xl border-2 transition-all ${
                                selected
                                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                                  : 'border-border hover:border-blue-300 hover:bg-secondary/50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">📦</span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm">{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Backend Name */}
                {newBackendForm.connector_type && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Backend Name</label>
                    <input
                      type="text"
                      value={newBackendForm.name}
                      onChange={(e) => setNewBackendForm({ ...newBackendForm, name: e.target.value })}
                      placeholder={`e.g., My ${connectorInfo[newBackendForm.connector_type]?.label || newBackendForm.connector_type} Backend`}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Dynamic config fields */}
                {newBackendForm.connector_type && connectorSchemas[newBackendForm.connector_type] && (() => {
                  const schema = connectorSchemas[newBackendForm.connector_type];
                  const requiredFields: string[] = schema.required || [];
                  const optionalFields: string[] = schema.optional || [];
                  const defaults: Record<string, any> = schema.defaults || {};
                  const allFields = [...requiredFields, ...optionalFields];

                  return (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="text-sm font-bold">Configuration</h3>
                      {allFields.map((key) => {
                        const isRequired = requiredFields.includes(key);
                        const defaultVal = defaults[key];
                        const isBoolean = typeof defaultVal === 'boolean';
                        const isNumber = typeof defaultVal === 'number';

                        return (
                          <div key={key}>
                            <label className="block text-sm font-medium mb-2">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              {isRequired && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {isBoolean ? (
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={newBackendForm.config[key] ?? defaultVal ?? false}
                                  onChange={(e) => setNewBackendForm({
                                    ...newBackendForm,
                                    config: { ...newBackendForm.config, [key]: e.target.checked }
                                  })}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-muted-foreground">Enable {key.replace(/_/g, ' ')}</span>
                              </label>
                            ) : key.includes('prompt') || key.includes('instructions') ? (
                              <textarea
                                value={newBackendForm.config[key] ?? ''}
                                onChange={(e) => setNewBackendForm({
                                  ...newBackendForm,
                                  config: { ...newBackendForm.config, [key]: e.target.value }
                                })}
                                rows={3}
                                placeholder={defaultVal != null ? `Default: ${defaultVal}` : ''}
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              />
                            ) : (
                              <input
                                type={isNumber ? 'number' : key.includes('key') ? 'password' : 'text'}
                                value={newBackendForm.config[key] ?? ''}
                                onChange={(e) => setNewBackendForm({
                                  ...newBackendForm,
                                  config: { ...newBackendForm.config, [key]: isNumber ? parseFloat(e.target.value) || 0 : e.target.value }
                                })}
                                placeholder={defaultVal != null ? `Default: ${defaultVal}` : ''}
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                <button
                  onClick={async () => {
                    if (!newBackendForm.name || !newBackendForm.connector_type) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    setCreatingBackend(true);
                    try {
                      const newBackend = await createBackend({
                        name: newBackendForm.name,
                        connector_type: newBackendForm.connector_type,
                        config_json: JSON.stringify(newBackendForm.config),
                      });
                      setBackends([newBackend, ...backends]);
                      setShowAddBackendModal(false);
                      setNewBackendForm({ name: '', connector_type: '', config: {} });
                    } catch (err) {
                      alert('Failed to create backend');
                    } finally {
                      setCreatingBackend(false);
                    }
                  }}
                  disabled={creatingBackend || !newBackendForm.name || !newBackendForm.connector_type}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-lg disabled:opacity-50"
                >
                  {creatingBackend ? 'Creating...' : 'Create Backend'}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div >
  );
}
