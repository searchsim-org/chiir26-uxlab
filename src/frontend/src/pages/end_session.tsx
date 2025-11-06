"use client";
import React from 'react';
import { useRouter } from 'next/router';
import { submitSurveyResponse } from '../services/apiService';
import Cookies from 'js-cookie';

export default function EndSession() {
  const router = useRouter();

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
      switch (question.response_type) {
        case 'scale':
          return (
            <div key={index} className="mb-6">
              <h4 className="text-xl mb-4">{question.question_text}</h4>
              <input
                type="range"
                name={question.question_id}
                id={question.question_id}
                min={question.scale_min}
                max={question.scale_max}
                defaultValue={question.scale_min}
                className="w-full"
              />
              <div className="flex justify-between">
                {question.scale_labels?.map((label, idx) => (
                  <span key={idx}>{label}</span>
                ))}
              </div>
            </div>
          );
        default:
          return null;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData);

    let userId = Cookies.get('user_id') || 'unknown_user';
    let tasksJson = Cookies.get('tasksList') || '[]';
    let tasks = JSON.parse(tasksJson);

    // Prepare the survey data
    const surveyData = {
      user_id: userId,
      timestamp: Math.floor(new Date().getTime() / 1000),
      tasks: tasks,
      content: formProps
    };

    try {
      // Submit the survey response
      await submitSurveyResponse(surveyData);
      const externalCookie = Cookies.get('external');
      if (externalCookie && externalCookie === 'PROLIFIC') {
        router.push('https://app.prolific.com/submissions/complete?cc=C1JKA44Q');
      } else {
        router.push('/');
      }
    } catch (error) {
      const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
      console.error('Error submitting survey response:', error);
      // Handle error, e.g., show a notification to the user
    }

    Cookies.remove('tasksList');
    Cookies.remove('external');
    const externalCookie = Cookies.get('external');
    if (externalCookie && externalCookie === 'PROLIFIC') {
      router.push('https://app.prolific.com/submissions/complete?cc=C1JKA44Q');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex h-screen bg-page-background bg-cover">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        <div className="text-center text-left-align mb-8 ml-10 pt-mobile sm:pt-0" style={{ paddingTop: '80%' }}>
          <span className="block text-lg mb-2 join-text-color">POST-SESSION QUESTIONNAIRE</span>
          <h1 className="text-5xl mb-4">Your Feedback Matters</h1>
          <h4 className="text-xl mb-4">Please, complete the following questionnaire.</h4>
        </div>
        <form onSubmit={handleSubmit} className="survey-form">
          {renderSatisfactionForm()}
          <button type="submit" className="py-4 px-20 bg-blue-500 text-white rounded-full text-lg mt-4">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}