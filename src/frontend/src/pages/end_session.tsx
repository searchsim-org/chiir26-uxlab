"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { submitSurveyResponse } from '../services/apiService';
import Cookies from 'js-cookie';

export default function EndSession() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const satisfactionQuestions = [
    {
      question_id: "stress_level",
      question_text: "How stressed are you feeling right now?",
      response_type: "scale",
      scale_min: 1,
      scale_max: 5,
      scale_labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
    },
    {
      question_id: "distraction_level",
      question_text: "How distracted are you right now?",
      response_type: "scale",
      scale_min: 1,
      scale_max: 5,
      scale_labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
    },
    {
      question_id: "search_layout_usefulness",
      question_text: "How useful was the search layout?",
      response_type: "scale",
      scale_min: 0,
      scale_max: 3,
      scale_labels: ["Not at all", "Somewhat", "Fairly", "Very useful"],
    },
    {
      question_id: "querying_satisfaction",
      question_text: "How satisfied are you with the querying process?",
      response_type: "scale",
      scale_min: 1,
      scale_max: 5,
      scale_labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
    },
    {
      question_id: "session_satisfaction",
      question_text: "How satisfied are you with the whole search session?",
      response_type: "scale",
      scale_min: 1,
      scale_max: 5,
      scale_labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
    },
  ];

  const renderSatisfactionForm = () => {
    return satisfactionQuestions.map((question, index) => {
      if (question.response_type !== 'scale') return null;
      return (
        <div key={index} className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm font-medium mb-4">{question.question_text}</p>
          <input
            type="range"
            name={question.question_id}
            id={question.question_id}
            min={question.scale_min}
            max={question.scale_max}
            defaultValue={question.scale_min}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {question.scale_labels?.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>
        </div>
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData);

    const userId = Cookies.get('user_id') || 'unknown_user';
    const tasksJson = Cookies.get('tasksList') || '[]';
    const tasks = JSON.parse(tasksJson);

    const surveyData = {
      user_id: userId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      tasks: tasks,
      content: formProps
    };

    try {
      await submitSurveyResponse(surveyData);
    } catch (error) {
      console.error('Error submitting survey response:', error);
    }

    Cookies.remove('tasksList');
    const externalCookie = Cookies.get('external');
    Cookies.remove('external');

    if (externalCookie && externalCookie === 'PROLIFIC') {
      router.push('https://app.prolific.com/submissions/complete?cc=C1JKA44Q');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex h-screen bg-page-background bg-cover text-foreground">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="block text-lg mb-2 text-blue-500 font-semibold tracking-wide uppercase">Post-Session Questionnaire</span>
            <h1 className="text-4xl mb-4 font-bold tracking-tight">Your Feedback Matters</h1>
            <p className="text-muted-foreground">Please complete this brief questionnaire about your experience.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {renderSatisfactionForm()}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-medium mt-6 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit & Finish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
