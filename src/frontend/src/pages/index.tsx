"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadSurveyQuestions, logUserAction, submitSurveyResponse, loadTopics } from '../services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface SurveyQuestion {
  question_id: string;
  question_text: string;
  response_type: string;
  scale_min?: number;
  scale_max?: number;
  scale_labels?: string[];
  choices?: string[];
}

export default function Home() {
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [idCode, setIdCode] = useState('');
  const [view, setView] = useState<'landing' | 'participant'>('landing');

  const router = useRouter();
  const { toast } = useToast();
  const { authenticated } = useAuth(); // We'll just use this to conditionally render dashboard link text

  const [studyMode, setStudyMode] = useState(false);
  const [participantIdInput, setParticipantIdInput] = useState('');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const { study_id, external_id, PROLIFIC_PID, SESSION_ID } = router.query;

    if (!study_id) return;

    // Auto-register if external_id or Prolific params present
    if (external_id || PROLIFIC_PID) {
      const extId = (external_id || PROLIFIC_PID) as string;
      const platform = PROLIFIC_PID ? 'prolific' : undefined;

      setRegistering(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/studies/${study_id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ external_id: extId, external_platform: platform }),
      })
        .then(res => res.json())
        .then(data => {
          router.push(`/participant-view?study_id=${study_id}&participant_id=${data.id}`);
        })
        .catch(() => {
          setRegistering(false);
          toast({ title: 'Error', description: 'Failed to register. Please try again.', variant: 'destructive' });
        });
      return;
    }

    // Show participant entry form
    setStudyMode(true);
  }, [router.query.study_id, router.query.external_id, router.query.PROLIFIC_PID]);

  // Handler for the Get Started button click (Participant)
  const handleGetStartedClick = async () => {
    if (!idCode) {
      toast({
        title: "Error",
        description: "Please enter a valid user study code to start the task.",
        variant: "destructive",
      });
      return;
    }

    try {
      const surveyData = await loadSurveyQuestions(idCode);
      // Check if surveyData is an array with an error message
      if (Array.isArray(surveyData) && surveyData[0]?.error) {
        toast({
          title: "Error",
          description: surveyData[0].error,
          variant: "destructive",
        });
        return;
      }
      // Additional check if surveyData is an object with an error property
      if (!surveyData || surveyData.error) {
        toast({
          title: "Error",
          description: surveyData?.error || "Error fetching survey data.",
          variant: "destructive",
        });
        return;
      }

      // Check if surveyData has user_study and store the information in localStorage
      if (surveyData.user_study) {
        // Store each property of user_study individually for easy access
        Object.entries(surveyData.user_study).forEach(([key, value]) => {
          Cookies.set(`user_study_${key}`, JSON.stringify(value));
        });
      }

      setSurveyQuestions(surveyData.questions || []);
      setShowSurvey(true);
      Cookies.set('idCode', idCode);
    } catch (error) {
      const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
      console.error('Error loading survey questions:', error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const renderSurveyForm = () => {
    return surveyQuestions.map((question, index) => (
      <div key={index} className="mb-4">
        <label htmlFor={question.question_id} className="block text-xl mb-2 text-foreground">
          {question.question_text}
        </label>
        {question.response_type === 'scale' && (
          <>
            <input
              type="range"
              id={question.question_id}
              name={question.question_id}
              min={question.scale_min}
              max={question.scale_max}
              defaultValue={0}
              className="w-full"
            />
            <div className="flex justify-between text-muted-foreground">
              {question.scale_labels?.map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
            </div>
          </>
        )}
        {question.response_type === 'integer' && (
          <input
            type="number"
            id={question.question_id}
            name={question.question_id}
            className="w-full bg-secondary border border-border rounded p-2"
          />
        )}
        {question.response_type === 'choice' && (
          <select
            id={question.question_id}
            name={question.question_id}
            className="w-full bg-secondary border border-border rounded p-2"
          >
            {question.choices?.map((choice, idx) => (
              <option key={idx} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        )}
        {question.response_type === 'text' && (
          <input
            type="text"
            id={question.question_id}
            name={question.question_id}
            className="w-full bg-secondary border border-border rounded p-2"
          />
        )}
      </div>
    ));
  };

  const handleIdCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submit action
    handleGetStartedClick(); // Call the existing Get Started click handler
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Collect form data
    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData);

    const query = router.query;
    let userId = '';
    if (query.PROLIFIC_PID && query.SESSION_ID) {
      userId = `${query.PROLIFIC_PID}_${query.SESSION_ID}`;
      Cookies.set('external', 'PROLIFIC');
    } else {
      userId = Cookies.get('user_id') || uuidv4();
      Cookies.set('external', '');
    }
    Cookies.set('user_id', userId);

    // Log the SEARCH_START action
    const timestamp = Math.floor(new Date().getTime() / 1000);
    await logUserAction({
      user_id: userId,
      task_id: idCode,
      action: 'SEARCH_START',
      query: '',
      content: '',
      timestamp: timestamp,
    });

    let tasks: string[] = [];

    try {
      const topicsData = await loadTopics(idCode);
      if (topicsData && Array.isArray(topicsData.topics)) {
        tasks = topicsData.topics.map((topic: { task_id: number }) => topic.task_id.toString());
        Cookies.set('tasksList', JSON.stringify(tasks));
        Cookies.set('topics', JSON.stringify(topicsData.topics));
      }
    } catch (error) {
      const message = (error instanceof Error) ? error.message : 'Failed to load topics';
      console.error(message, error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }

    // Prepare the survey data
    const surveyData = {
      user_id: userId,
      timestamp: timestamp,
      tasks: tasks,
      content: formProps
    };

    try {
      await submitSurveyResponse(surveyData);

    } catch (error) {
      const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
      console.error('Error submitting survey response:', error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }

    // Navigate to the tasks page
    router.push('/tasks?task_id=1');
  };

  if (registering) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Registering participant...</p>
        </div>
      </div>
    );
  }

  if (studyMode) {
    const studyId = router.query.study_id;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-lg border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Join Study</h2>
          <p className="text-muted-foreground mb-6">Enter your participant ID to begin the study.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!participantIdInput.trim()) return;
            setRegistering(true);
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/studies/${studyId}/participants`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ external_id: participantIdInput.trim() }),
                }
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.detail || 'Registration failed');
              router.push(`/participant-view?study_id=${studyId}&participant_id=${data.id}`);
            } catch (err: any) {
              toast({ title: 'Error', description: err.message || 'Failed to register', variant: 'destructive' });
              setRegistering(false);
            }
          }}>
            <input
              type="text"
              value={participantIdInput}
              onChange={(e) => setParticipantIdInput(e.target.value)}
              placeholder="Your Participant ID (e.g., PROLIFIC_PID)"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />
            <button
              type="submit"
              disabled={!participantIdInput.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-lg disabled:opacity-50"
            >
              Start Study
            </button>
          </form>
          <button
            onClick={() => { setStudyMode(false); router.push('/'); }}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to home
          </button>
        </div>
      </div>
    );
  }

  // Render Landing Page
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Experimenter Card */}
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all group">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Experimenters</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Design, configure, and manage complex information access studies using our no-code dashboard.
            </p>
            <Link
              href={authenticated ? "/dashboard" : "/auth/login"}
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              Go to Dashboard &rarr;
            </Link>
          </div>

          {/* Participant Card */}
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all group">
            <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Participants</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Participating in a study? Enter your access code here to begin your session.
            </p>
            <button
              onClick={() => setView('participant')}
              className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
            >
              Enter Study Code &rarr;
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} UXLab System. All rights reserved.</p>
        </div>
      </div>
    );
  }

  // Render Participant Interface (Original View)
  return (
    <div className="flex h-screen bg-page-background bg-cover text-foreground">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-8">
        <button
          onClick={() => setView('landing')}
          className="absolute top-8 left-8 text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        {!showSurvey ? (
          <>
            <div className="text-center text-left-align mb-8 ml-10">
              <span className="block text-lg mb-10 opacity-60 uppercase tracking-wider">Participant Interface</span>
              <h1 className="text-5xl mb-4 font-bold tracking-tight">Start a Session</h1>
              <h4 className="text-xl mb-4 text-muted-foreground">Click Get started to begin. First, complete a brief pre-task questionnaire.<br /> Then, perform the necessary searches.</h4>
            </div>
            <div className="flex flex-col text-left-align w-full max-w-md px-4">
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-md text-blue-600 dark:text-blue-300">
                  Testing the platform? Use code <span className="font-semibold">CHIIR26</span>
                </p>
              </div>
              <form onSubmit={handleIdCodeSubmit} className="flex flex-col text-left-align">
                <input
                  type="text"
                  placeholder="Enter ID Code"
                  className="input-custom mb-4 p-3 rounded-xl border border-border bg-background text-foreground block w-full outline-none focus:ring-2 focus:ring-blue-500"
                  value={idCode}
                  onChange={(e) => setIdCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-6 py-4 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl block w-full"
                >
                  Get Started
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-center text-left-align mb-8 ml-10">
              <span className="block text-lg mb-2 text-blue-500 font-semibold tracking-wide">PRE-TASK QUESTIONNAIRE</span>
              <h1 className="text-4xl mb-4 font-bold">Initial Info</h1>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
              {renderSurveyForm()}
              <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-medium mt-6 transition-all shadow-lg">
                Submit & Begin
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}