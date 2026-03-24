import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ProcedureStep, QuestionnaireQuestion } from '../types/study';
import ParticipantChat from '../components/participant/ParticipantChat';
import ParticipantSERP from '../components/participant/ParticipantSERP';
import { getBackend } from '../services/studyService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function flattenProcedure(steps: ProcedureStep[], conditionOrder: string[]): ProcedureStep[] {
  const result: ProcedureStep[] = [];
  for (const step of steps) {
    if (step.type === 'block') {
      const children = step.children || [];
      if (conditionOrder.length > 0) {
        const orderMap = new Map(conditionOrder.map((name, i) => [name, i]));
        const sorted = [...children].sort((a, b) => {
          const aIdx = orderMap.get(a.title) ?? conditionOrder.length;
          const bIdx = orderMap.get(b.title) ?? conditionOrder.length;
          return aIdx - bIdx;
        });
        result.push(...sorted);
      } else {
        result.push(...children);
      }
    } else {
      result.push(step);
    }
  }
  return result;
}

interface Study {
  id: number;
  name: string;
  procedure_json: string | null;
}

interface Participant {
  id: number;
  external_id: string;
  current_step: number;
  condition_order: string[] | null;
  completion_code: string | null;
  status: string;
}

export default function ParticipantView() {
  const router = useRouter();
  const { study_id, participant_id, external_id } = router.query;

  const [study, setStudy] = useState<Study | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [procedureSteps, setProcedureSteps] = useState<ProcedureStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [taskComplete, setTaskComplete] = useState(false);
  const [backendInfo, setBackendInfo] = useState<Record<number, string>>({});
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [questionnaireSubmitted, setQuestionnaireSubmitted] = useState(false);

  // Pause state
  const [pausedUntil, setPausedUntil] = useState<string | null>(null);
  const [pauseCountdown, setPauseCountdown] = useState<string>('');

  // Completion redirect state
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Current step from participant or fallback
  const currentStep = participant?.current_step ?? 0;
  const totalSteps = procedureSteps.length || 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // Load study and register/fetch participant
  useEffect(() => {
    async function loadData() {
      if (!study_id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch study
        const studyRes = await fetch(`${API_BASE}/api/v1/studies/${study_id}`);
        if (!studyRes.ok) throw new Error('Study not found');
        const studyData = await studyRes.json();
        setStudy(studyData);

        // Parse procedure
        let parsedSteps: ProcedureStep[] = [];
        if (studyData.procedure_json) {
          try {
            const procedure = JSON.parse(studyData.procedure_json);
            if (procedure.steps) {
              parsedSteps = procedure.steps;
            }
          } catch (e) {
            console.error('Failed to parse procedure:', e);
          }
        }

        // Register or fetch participant
        let participantData: any = null;

        if (external_id) {
          const participantRes = await fetch(
            `${API_BASE}/api/v1/studies/${study_id}/participants`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ external_id })
            }
          );
          if (participantRes.ok) {
            participantData = await participantRes.json();
            setParticipant(participantData);
          }
        } else if (participant_id) {
          const participantRes = await fetch(
            `${API_BASE}/api/v1/studies/${study_id}/participants/${participant_id}`
          );
          if (participantRes.ok) {
            participantData = await participantRes.json();
            setParticipant(participantData);
          }
        }

        // Initialize pause state if participant is currently paused
        if (participantData?.paused_until) {
          const remaining = new Date(participantData.paused_until).getTime() - Date.now();
          if (remaining > 0) {
            setPausedUntil(participantData.paused_until);
          }
        }

        // Flatten procedure using participant's condition order
        if (participantData && parsedSteps.length > 0) {
          const condOrder = participantData.condition_order || [];
          const flat = flattenProcedure(parsedSteps, condOrder);
          setProcedureSteps(flat);

          // Fetch backend connector types for condition steps
          const configIds = new Set<number>();
          for (const step of flat) {
            if (step.type === 'condition' && step.backend_config_id) {
              configIds.add(step.backend_config_id);
            }
          }
          const info: Record<number, string> = {};
          for (const id of Array.from(configIds)) {
            try {
              const backend = await getBackend(id);
              info[id] = backend.connector_type;
            } catch {
              // Backend may have been deleted
            }
          }
          setBackendInfo(info);
        } else {
          setProcedureSteps(parsedSteps);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to load study:', err);
        setError('Failed to load study. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [study_id, external_id, participant_id]);

  // Reset questionnaire state on step change
  useEffect(() => {
      setQuestionnaireAnswers({});
      setQuestionnaireSubmitted(false);
      setTaskComplete(false);
  }, [currentStep]);

  // Pause countdown timer
  useEffect(() => {
    if (!pausedUntil) {
      setPauseCountdown('');
      return;
    }
    const tick = () => {
      const target = new Date(pausedUntil).getTime();
      const remaining = target - Date.now();
      if (remaining <= 0) {
        setPausedUntil(null);
        setPauseCountdown('');
      } else {
        const totalSeconds = Math.ceil(remaining / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        const parts: string[] = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0 || h > 0) parts.push(`${m}m`);
        parts.push(`${s}s`);
        setPauseCountdown(parts.join(' '));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [pausedUntil]);

  // Redirect countdown after completion
  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0 && redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    const timeout = setTimeout(() => {
      setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [redirectCountdown, redirectUrl]);

  const submitQuestionnaire = async (): Promise<boolean> => {
      if (!study_id || !participant?.id) return false;
      const step = procedureSteps[currentStep];
      const unanswered = (step.questions ?? []).filter(q => q.required && questionnaireAnswers[q.id] == null);
      if (unanswered.length > 0) {
          alert(`Please answer all required questions (${unanswered.length} remaining).`);
          return false;
      }
      try {
          const res = await fetch(
              `${API_BASE}/api/v1/studies/${study_id}/participants/${participant.id}/questionnaire_responses`,
              {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      step_index: currentStep,
                      step_title: step.title,
                      responses: questionnaireAnswers,
                  }),
              }
          );
          if (res.ok) {
              setQuestionnaireSubmitted(true);
              return true;
          }
          return false;
      } catch {
          return false;
      }
  };

  // Advance to next step
  const advanceStep = async () => {
    if (!study_id || !participant?.id) return;

    // For questionnaire steps, submit answers first
    if (currentStepInfo.type === 'questionnaire' && !currentStepInfo.externalUrl && !questionnaireSubmitted) {
      const ok = await submitQuestionnaire();
      if (!ok) return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/studies/${study_id}/participants/${participant.id}/advance`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        setParticipant(prev => prev ? { ...prev, current_step: data.current_step } : null);

        // Handle pause
        if (data.paused === true && data.paused_until) {
          setPausedUntil(data.paused_until);
        }

        if (data.completed) {
          // Show completion code
          setParticipant(prev => prev ? { ...prev, completion_code: data.completion_code, status: 'completed' } : null);
          // Start redirect countdown if redirect_url provided
          if (data.redirect_url) {
            setRedirectUrl(data.redirect_url);
            setRedirectCountdown(5);
          }
        }
      } else if (res.status === 403) {
        // Participant is still paused — keep showing countdown, don't crash
        console.warn('Advance blocked: participant is still paused.');
      }
    } catch (err) {
      console.error('Failed to advance step:', err);
    }
  };

  // Get current step info
  const currentStepInfo = procedureSteps[currentStep] || {
    type: 'condition',
    title: 'Information Seeking Task',
    content: 'Complete the search task using the system below.'
  };

  const renderQuestion = (q: QuestionnaireQuestion) => {
      const value = questionnaireAnswers[q.id];
      const set = (val: any) => setQuestionnaireAnswers(prev => ({ ...prev, [q.id]: val }));

      switch (q.type) {
          case 'scale':
              return (
                  <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{q.scaleLabels?.[0] ?? q.scaleMin ?? 1}</span>
                          <span>{q.scaleLabels?.[q.scaleLabels.length - 1] ?? q.scaleMax ?? 7}</span>
                      </div>
                      <input
                          type="range"
                          min={q.scaleMin ?? 1}
                          max={q.scaleMax ?? 7}
                          value={value ?? Math.round(((q.scaleMax ?? 7) + (q.scaleMin ?? 1)) / 2)}
                          onChange={e => set(parseInt(e.target.value))}
                          className="w-full"
                      />
                      <div className="text-center text-sm font-medium mt-1">{value ?? '—'}</div>
                  </div>
              );
          case 'likert': {
              const opts = q.options ?? q.scaleLabels ?? ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
              return (
                  <div className="flex space-x-2 flex-wrap gap-y-2">
                      {opts.map((opt, i) => (
                          <label key={i} className={`flex-1 text-center text-xs p-2 rounded-lg border cursor-pointer transition-all ${value === i + 1 ? 'border-blue-500 bg-blue-500/10 font-medium' : 'border-border hover:border-blue-500/50'}`}>
                              <input type="radio" name={q.id} className="sr-only" checked={value === i + 1} onChange={() => set(i + 1)} />
                              {opt}
                          </label>
                      ))}
                  </div>
              );
          }
          case 'choice':
              return (
                  <div className="space-y-2">
                      {(q.options ?? []).map(opt => (
                          <label key={opt} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${value === opt ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-blue-500/50'}`}>
                              <input type="radio" name={q.id} className="sr-only" checked={value === opt} onChange={() => set(opt)} />
                              <span className="text-sm">{opt}</span>
                          </label>
                      ))}
                  </div>
              );
          case 'integer':
              return (
                  <input
                      type="number"
                      value={value ?? ''}
                      onChange={e => set(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-32 bg-secondary border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
              );
          case 'text':
          default:
              return (
                  <textarea
                      value={value ?? ''}
                      onChange={e => set(e.target.value)}
                      rows={3}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
              );
      }
  };

  const renderStepContent = () => {
    if (!currentStepInfo) return null;

    switch (currentStepInfo.type) {
      case 'briefing':
      case 'end':
        return (
          <div className="max-w-2xl mx-auto py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">{currentStepInfo.title}</h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {currentStepInfo.content || 'Please continue to the next step.'}
            </div>
          </div>
        );

      case 'questionnaire':
        if (currentStepInfo.externalUrl) {
          return (
            <div className="w-full h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4">{currentStepInfo.title}</h2>
              <iframe
                src={currentStepInfo.externalUrl}
                className="flex-1 w-full border border-border rounded-xl"
                style={{ minHeight: '600px' }}
                title={currentStepInfo.title}
                allow="fullscreen"
              />
            </div>
          );
        }
        return (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-xl font-bold mb-2">{currentStepInfo.title}</h2>
            {currentStepInfo.content && (
              <p className="text-muted-foreground mb-8">{currentStepInfo.content}</p>
            )}
            {(currentStepInfo.questions ?? []).length === 0 ? (
              <p className="text-muted-foreground">No questions configured for this step.</p>
            ) : (
              <div className="space-y-8">
                {currentStepInfo.questions!.map((q, i) => (
                  <div key={q.id} className="bg-card rounded-xl border border-border p-6">
                    <p className="text-sm font-medium mb-4">
                      {i + 1}. {q.text}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {renderQuestion(q)}
                  </div>
                ))}
              </div>
            )}
            {questionnaireSubmitted && (
              <p className="text-green-600 text-sm mt-6 text-center">Responses saved. Click Continue to proceed.</p>
            )}
          </div>
        );

      case 'condition': {
        const connectorType = backendInfo[currentStepInfo.backend_config_id || 0];
        const isSearch = connectorType === 'bing' || connectorType === 'tavily';

        if (isSearch) {
          return (
            <ParticipantSERP
              studyId={study_id as string}
              participantId={participant!.id}
              backendName={currentStepInfo.backend}
            />
          );
        }
        return (
          <ParticipantChat
            studyId={study_id as string}
            participantId={participant!.id}
            backendName={currentStepInfo.backend}
          />
        );
      }

      case 'pause':
        return (
          <div className="max-w-2xl mx-auto py-12 text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Pause</h2>
            {pausedUntil ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-4">
                <p className="text-yellow-600 font-medium text-lg">Time remaining: {pauseCountdown || '...'}</p>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-4">
                <p className="text-green-600 font-medium">Pause period has ended. You may continue.</p>
              </div>
            )}
            <p className="text-muted-foreground">
              Please return after {currentStepInfo.pauseDuration} {currentStepInfo.pauseUnit || 'hours'}.
            </p>
            {currentStepInfo.content && (
              <p className="text-muted-foreground mt-4">{currentStepInfo.content}</p>
            )}
          </div>
        );

      default:
        return <p className="text-muted-foreground text-center py-12">Unknown step type.</p>;
    }
  };

  if (loading || !participant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading study...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.reload()} className="text-blue-500 hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (participant?.status === 'completed' && participant?.completion_code) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Study Complete!</h1>
          <p className="text-muted-foreground mb-6">Thank you for participating in this study.</p>
          <div className="bg-secondary rounded-xl p-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your completion code:</p>
            <p className="text-2xl font-mono font-bold tracking-wider">{participant.completion_code}</p>
          </div>
          <p className="text-xs text-muted-foreground">Please copy this code and return to your recruitment platform.</p>
          {redirectUrl && redirectCountdown !== null && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Redirecting to your recruitment platform in {redirectCountdown} seconds...
              </p>
              <a
                href={redirectUrl}
                className="text-xs text-blue-500 hover:underline mt-2 inline-block"
              >
                Click here if not redirected
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                Step {currentStep + 1} of {totalSteps}
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
                  {currentStepInfo.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStepInfo.content || 'Complete the task below to continue.'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-purple-600">
                  {participant?.condition_order?.[0] || 'Active Condition'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {totalSteps}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {currentStepInfo.type === 'questionnaire' && !currentStepInfo.externalUrl ? (
                <button
                  onClick={() => { advanceStep(); }}
                  disabled={questionnaireSubmitted || !!pausedUntil}
                  className={`px-8 py-3 rounded-full font-medium text-sm transition-all flex items-center space-x-2 ${
                    !questionnaireSubmitted && !pausedUntil
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl cursor-pointer'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>{questionnaireSubmitted ? 'Responses Submitted' : 'Submit & Continue'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setTaskComplete(!taskComplete)}
                    className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${taskComplete
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-secondary text-foreground hover:bg-accent border border-border'
                    }`}
                  >
                    {taskComplete ? 'Task Marked Complete' : 'Mark Task as Complete'}
                  </button>
                  <button
                    disabled={!taskComplete || !!pausedUntil}
                    onClick={() => { advanceStep(); setTaskComplete(false); }}
                    className={`px-8 py-3 rounded-full font-medium text-sm transition-all flex items-center space-x-2 ${taskComplete && !pausedUntil
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl cursor-pointer'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Continue to Next Step</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Window - Dynamic Step Content */}
      <div className="flex-1 bg-background p-6 overflow-auto">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {renderStepContent()}
        </div>
      </div>

      {/* System Info Bar */}
      <div className="bg-card border-t border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Study: {study?.name || study_id}</span>
              <span>•</span>
              <span>Participant: {participant?.external_id || participant_id}</span>
              <span>•</span>
              <span className="text-green-600">Session Active</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              {currentStepInfo?.type === 'condition' && (
                <>
                  <span>•</span>
                  <span>{currentStepInfo.backend || 'Unknown Backend'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
