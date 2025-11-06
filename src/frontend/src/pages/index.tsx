"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { loadSurveyQuestions, logUserAction, submitSurveyResponse, loadTopics } from '../services/apiService';
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

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
  const router = useRouter();
  const { toast } = useToast();

  // Handler for the Get Started button click
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
        <label htmlFor={question.question_id} className="block text-xl mb-2">
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
            <div className="flex justify-between">
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
            className="input-questionnaire text-white block w-full"
          />
        )}
        {question.response_type === 'choice' && (
          <select
            id={question.question_id}
            name={question.question_id}
            className="input-questionnaire text-white block w-full"
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
            className="input-questionnaire text-white block w-full"
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

  return (
    <div className="flex h-screen bg-page-background bg-cover">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        {!showSurvey ? (
          <>
            <div className="text-center text-left-align mb-8 ml-10">
              <span className="block text-lg mb-2 join-text-color">USER SEARCH STUDY</span>
              <h1 className="text-5xl mb-4">Start a Search Session.</h1>
              <h4 className="text-xl mb-4">Click Get started to begin. First, complete a brief pre-task questionnaire.<br /> Then, perform the necessary searches and click End task when finished. </h4>
            </div>
            <div className="flex flex-col text-left-align">
              <form onSubmit={handleIdCodeSubmit} className="flex flex-col text-left-align">
                <input
                  type="text"
                  placeholder="Enter ID Code"
                  className="input-custom mb-4 p-2 rounded text-white block"
                  value={idCode}
                  onChange={(e) => setIdCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-8 py-4 px-10 bg-blue-500 text-white rounded-full text-lg button-modified block"
                >
                  Get Started
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-center text-left-align mb-8 ml-10">
              <span className="block text-lg mb-2 join-text-color">PRE-TASK QUESTIONNAIRE</span>
              <h1 className="text-5xl mb-4">Start a Search Session.</h1>
            </div>
            <form onSubmit={handleSubmit} className="survey-form">
              {renderSurveyForm()}
              <button type="submit" className="py-4 px-20 bg-blue-500 text-white rounded-full text-lg mt-4">
                Submit
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}