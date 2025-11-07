import axios from 'axios';

// Create an Axios instance with the base URL
const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8100',
});

// Function to load survey questions
export const loadSurveyQuestions = async (idCode: string) => {
  try {
    const uppercaseIdCode = idCode.toUpperCase(); 
    const response = await apiService.get(`/api/v1/loaduserstudy/${uppercaseIdCode}`);
    return response.data;
  } catch (error) {
    // Handle errors here, e.g., logging or user notifications
    throw error;
  }
};

export const loadTopics = async (idCode: string) => {
  try {
    const uppercaseIdCode = idCode.toUpperCase();
    const response = await apiService.get(`/api/v1/loadtopics/${uppercaseIdCode}`);
    return response.data;
  } catch (error) {
    // Handle errors here, e.g., logging or user notifications
    throw error;
  }
};

export const loadSearchEngine = async (idCode: string) => {
  try {
    const uppercaseIdCode = idCode.toUpperCase(); 
    const response = await apiService.get(`/api/v1/loadsearchengine/${uppercaseIdCode}`);
    return response.data;
  } catch (error) {
    // Handle errors here, e.g., logging or user notifications
    throw error;
  }
};

export const logUserAction = async (logData: {
  user_id: string;
  task_id: string;
  action: string;
  query: string;
  content: string;
  timestamp: number;
}) => {
  try {
    await apiService.post('/api/v1/log_activity', logData);
  } catch (error) {
    // Handle errors here, e.g., logging or user notifications
    throw error;
  }
};

export const submitSurveyResponse = async (surveyData: {
  user_id: string;
  timestamp: number;
  tasks: string[];
  content: object;
}) => {
  try {
    const response = await apiService.post('/api/v1/survey_responses', surveyData);
    return response.data;
  } catch (error) {
    // Handle errors here, e.g., logging or user notifications
    throw error;
  }
};

export default apiService;