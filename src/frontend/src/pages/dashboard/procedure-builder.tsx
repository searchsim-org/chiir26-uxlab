import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getStudy, updateStudy, Study, getBackends, Backend } from '../../services/studyService';
import { ProcedureStep } from '../../types/study';

export default function ProcedureBuilder() {
  const router = useRouter();
  const { study_id } = router.query;

  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backends, setBackends] = useState<Backend[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [procedureSteps, setProcedureSteps] = useState<ProcedureStep[]>([
    { id: 1, type: 'briefing', title: 'Study Introduction & Consent', content: 'Welcome participants and obtain informed consent' },
    { id: 2, type: 'questionnaire', title: 'Demographics Survey', content: 'Pre-study questionnaire (Age, Education, Search Experience)' },
    {
      id: 3, type: 'block', title: 'Counterbalanced Conditions', isCounterbalanced: true, children: [
        { id: 31, type: 'condition', title: 'Condition A: GPT-4 RAG System', backend: 'OpenAI GPT-4 Turbo', duration: '15 min' },
        { id: 32, type: 'condition', title: 'Condition B: Traditional Search (Bing)', backend: 'Bing Search API', duration: '15 min' }
      ]
    },
    { id: 4, type: 'questionnaire', title: 'System Usability Scale (SUS)', content: 'Post-task usability assessment' },
    { id: 5, type: 'questionnaire', title: 'Preference & Satisfaction Questions', content: 'Comparative preference questionnaire' },
    { id: 6, type: 'end', title: 'Study Completion', content: 'Thank you message and completion code generation' }
  ]);

  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [nextId, setNextId] = useState(100);

  // Load study data on mount
  useEffect(() => {
    async function loadStudy() {
      if (!study_id || typeof study_id !== 'string') {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        try {
          const backendsRes = await getBackends();
          setBackends(backendsRes.backends);
        } catch (e) {
          console.error('Failed to fetch backends:', e);
        }

        const studyData = await getStudy(parseInt(study_id));
        setStudy(studyData);

        // Load procedure from study if exists
        if (studyData.procedure_json) {
          try {
            const procedure = JSON.parse(studyData.procedure_json);
            if (procedure.steps && Array.isArray(procedure.steps)) {
              setProcedureSteps(procedure.steps);
              // Update nextId to avoid conflicts
              const maxId = findMaxId(procedure.steps);
              setNextId(maxId + 1);
            }
          } catch (e) {
            console.error('Failed to parse procedure JSON:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load study:', err);
        setError('Failed to load study. Using default procedure.');
      } finally {
        setLoading(false);
      }
    }
    loadStudy();
  }, [study_id]);

  // Find max ID in procedure steps (recursive)
  const findMaxId = (steps: ProcedureStep[]): number => {
    let maxId = 0;
    for (const step of steps) {
      maxId = Math.max(maxId, step.id);
      if (step.children) {
        maxId = Math.max(maxId, findMaxId(step.children));
      }
    }
    return maxId;
  };

  // Save procedure to backend
  const handleSave = async () => {
    if (!study_id || typeof study_id !== 'string') {
      alert('No study ID provided');
      return;
    }

    setSaving(true);
    try {
      const procedureJson = JSON.stringify({ steps: procedureSteps });
      await updateStudy(parseInt(study_id), { procedure_json: procedureJson });
      alert('Procedure saved successfully!');
    } catch (err) {
      console.error('Failed to save procedure:', err);
      alert('Failed to save procedure. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new step
  const addStep = (type: ProcedureStep['type']) => {
    const newStep: ProcedureStep = {
      id: nextId,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: ''
    };

    if (type === 'block') {
      newStep.isCounterbalanced = true;
      newStep.randomizeOrder = false;
      newStep.children = [];
      newStep.title = 'Counterbalanced Block';
    }

    if (type === 'pause') {
      newStep.pauseDuration = 24;
      newStep.pauseUnit = 'hours';
      newStep.title = 'Wait Period';
      newStep.content = 'Participant will be asked to return after the specified time.';
    }

    if (type === 'condition') {
      newStep.duration = '15 min';
      newStep.backend = '';
    }

    setProcedureSteps([...procedureSteps, newStep]);
    setNextId(nextId + 1);
    setSelectedStep(newStep.id);
  };

  // Delete a step (recursive - also removes from block children)
  const deleteStep = (id: number) => {
    const filtered = procedureSteps.filter(step => step.id !== id);
    const cleaned = filtered.map(step => {
      if (step.type === 'block' && step.children) {
        return { ...step, children: step.children.filter(child => child.id !== id) };
      }
      return step;
    });
    setProcedureSteps(cleaned);
    if (selectedStep === id) {
      setSelectedStep(null);
    }
  };

  // Move step up
  const moveStepUp = (index: number) => {
    if (index <= 0) return;
    const newSteps = [...procedureSteps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setProcedureSteps(newSteps);
  };

  // Move step down
  const moveStepDown = (index: number) => {
    if (index >= procedureSteps.length - 1) return;
    const newSteps = [...procedureSteps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setProcedureSteps(newSteps);
  };

  // Update step property (also updates block children)
  const updateStep = (id: number, updates: Partial<ProcedureStep>) => {
    setProcedureSteps(procedureSteps.map(step => {
      if (step.id === id) return { ...step, ...updates };
      if (step.type === 'block' && step.children) {
        return {
          ...step,
          children: step.children.map(child =>
            child.id === id ? { ...child, ...updates } : child
          )
        };
      }
      return step;
    }));
  };

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
                <span className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : study?.name || 'New Study'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {error && <span className="text-xs text-orange-500">{error}</span>}
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-secondary">
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Procedure'}
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
                    onClick={() => addStep(component.type)}
                    className={`bg-card border-2 border-${component.color}-500/30 rounded-xl p-4 cursor-pointer hover:border-${component.color}-500 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-${component.color}-500/10 flex items-center justify-center text-${component.color}-500`}>
                        {getStepIcon(component.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{component.label}</div>
                        <div className="text-xs text-muted-foreground">Click to add</div>
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
                    className={`bg-card rounded-2xl border-2 transition-all cursor-pointer ${selectedStep === step.id
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
                                  {step.children.map((child: ProcedureStep) => (
                                    <div
                                      key={child.id}
                                      onClick={(e) => { e.stopPropagation(); setSelectedStep(child.id); }}
                                      className="bg-secondary rounded-xl p-4 border border-border relative group/child cursor-pointer hover:border-purple-500/50 transition-all"
                                    >
                                      <button
                                        onClick={(e) => { e.stopPropagation(); deleteStep(child.id); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover/child:opacity-100 text-muted-foreground hover:text-red-500 p-1 rounded transition-all"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
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
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newChild: ProcedureStep = {
                                      id: nextId,
                                      type: 'condition',
                                      title: `Condition ${(step.children?.length || 0) + 1}`,
                                      backend: '',
                                      duration: '15 min',
                                    };
                                    updateStep(step.id, {
                                      children: [...(step.children || []), newChild]
                                    });
                                    setNextId(nextId + 1);
                                  }}
                                  className="mt-3 w-full border-2 border-dashed border-border hover:border-purple-500 rounded-xl px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-all flex items-center justify-center space-x-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span>Add Condition to Block</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveStepUp(index); }}
                            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveStepDown(index); }}
                            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                            className="text-muted-foreground hover:text-red-500 p-2 rounded-lg hover:bg-secondary transition-colors"
                          >
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
              <div className="flex justify-center py-6 relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="border-2 border-dashed border-border hover:border-blue-500 rounded-2xl px-8 py-4 text-sm text-muted-foreground hover:text-foreground transition-all flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Step</span>
                </button>
                {showAddMenu && (
                  <div className="absolute top-full mt-2 bg-card border border-border rounded-xl shadow-lg py-2 z-10 min-w-[220px]">
                    {availableComponents.map((component) => (
                      <button
                        key={component.type}
                        onClick={() => { addStep(component.type); setShowAddMenu(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors flex items-center space-x-3"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-${component.color}-500/10 flex items-center justify-center text-${component.color}-500`}>
                          {getStepIcon(component.type)}
                        </div>
                        <span>{component.label}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                    const step = procedureSteps.find(s => s.id === selectedStep)
                      || procedureSteps.flatMap(s => s.children || []).find(c => c.id === selectedStep);
                    if (!step) return null;

                    return (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-3">Step Title</label>
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {(step.type === 'briefing' || step.type === 'end') && (
                          <div>
                            <label className="block text-sm font-medium mb-3">Content</label>
                            <textarea
                              value={step.content || ''}
                              onChange={(e) => updateStep(step.id, { content: e.target.value })}
                              rows={6}
                              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                          </div>
                        )}

                        {step.type === 'questionnaire' && (
                          <div>
                            <label className="block text-sm font-medium mb-3">Question Set</label>
                            <select
                              value={step.questionnaireType || 'demographics'}
                              onChange={(e) => updateStep(step.id, { questionnaireType: e.target.value })}
                              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="demographics">Demographics</option>
                              <option value="nasa-tlx">NASA-TLX (Cognitive Load)</option>
                              <option value="sus">System Usability Scale (SUS)</option>
                              <option value="satisfaction">User Satisfaction</option>
                              <option value="custom">Custom Questions</option>
                            </select>
                            <button className="mt-3 text-sm text-blue-500 hover:text-blue-600 font-medium">
                              + Customize Questions
                            </button>
                            <div className="mt-4">
                              <label className="block text-sm font-medium mb-3">External URL (optional)</label>
                              <input
                                type="url"
                                value={step.externalUrl || ''}
                                onChange={(e) => updateStep(step.id, { externalUrl: e.target.value || undefined })}
                                placeholder="https://example.com/survey"
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                If set, participants will see this URL in an iframe instead of inline questions.
                              </p>
                            </div>
                          </div>
                        )}

                        {step.type === 'condition' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-3">Backend System</label>
                              <select
                                value={step.backend_config_id || ''}
                                onChange={(e) => {
                                  const backendId = parseInt(e.target.value);
                                  const backend = backends.find(b => b.id === backendId);
                                  updateStep(step.id, {
                                    backend_config_id: backendId || undefined,
                                    backend: backend?.name || ''
                                  });
                                }}
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value="">Select a backend...</option>
                                {backends.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name} ({b.connector_type})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-3">Task Description</label>
                              <textarea
                                value={step.content || ''}
                                onChange={(e) => updateStep(step.id, { content: e.target.value })}
                                rows={4}
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Enter the task description participants will see..."
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-3">Time Limit (optional)</label>
                              <input
                                type="text"
                                value={step.duration || ''}
                                onChange={(e) => updateStep(step.id, { duration: e.target.value })}
                                placeholder="e.g., 15 minutes"
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </>
                        )}

                        {step.type === 'block' && (
                          <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                              <div>
                                <span className="text-sm font-medium">Enable Counterbalancing</span>
                                <p className="text-xs text-muted-foreground mt-1">Use Latin square for condition order</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={step.isCounterbalanced}
                                onChange={(e) => updateStep(step.id, { isCounterbalanced: e.target.checked })}
                                className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                            </label>
                            <label className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                              <div>
                                <span className="text-sm font-medium">Randomize Order</span>
                                <p className="text-xs text-muted-foreground mt-1">Fully random (not balanced)</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={step.randomizeOrder}
                                onChange={(e) => updateStep(step.id, { randomizeOrder: e.target.checked, isCounterbalanced: false })}
                                className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                            </label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Counterbalancing ensures each condition order appears equally often. Random order may cause imbalances.
                            </p>
                          </div>
                        )}

                        {step.type === 'pause' && (
                          <div className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-700">Time-Delayed Study</span>
                              </div>
                              <p className="text-xs text-yellow-600">
                                Participants will be asked to return after the specified wait period.
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-3">Wait Duration</label>
                              <div className="flex space-x-3">
                                <input
                                  type="number"
                                  min={1}
                                  value={step.pauseDuration || 24}
                                  onChange={(e) => updateStep(step.id, { pauseDuration: parseInt(e.target.value) || 1 })}
                                  className="w-24 bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <select
                                  value={step.pauseUnit || 'hours'}
                                  onChange={(e) => updateStep(step.id, { pauseUnit: e.target.value as 'minutes' | 'hours' | 'days' })}
                                  className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                  <option value="minutes">Minutes</option>
                                  <option value="hours">Hours</option>
                                  <option value="days">Days</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-3">Return Message</label>
                              <textarea
                                value={step.content || ''}
                                onChange={(e) => updateStep(step.id, { content: e.target.value })}
                                rows={3}
                                placeholder="Message shown when participant returns after the wait period..."
                                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="pt-6 border-t border-border">
                          <label className="block text-sm font-medium mb-4">Step Options</label>
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={step.required !== false}
                                onChange={(e) => updateStep(step.id, { required: e.target.checked })}
                                className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-muted-foreground">Required to complete</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={step.allowSkip || false}
                                onChange={(e) => updateStep(step.id, { allowSkip: e.target.checked })}
                                className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-muted-foreground">Allow skip</span>
                            </label>
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={step.showInProgress !== false}
                                onChange={(e) => updateStep(step.id, { showInProgress: e.target.checked })}
                                className="w-4 h-4 rounded border-border focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-muted-foreground">Show in progress bar</span>
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
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
