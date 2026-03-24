import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChatPanel } from "@/components/chat-panel";
import { useMessageStore } from "@/stores";
import { loadTopics, loadSearchEngine } from '../services/apiService';
import { useToast } from "@/components/ui/use-toast";
import { logUserAction } from "../services/apiService";
import Cookies from 'js-cookie';

type Task = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  task_id: number;
};

type SearchEngine = {
  type: string;
};


export default function StartPage() {
  const router = useRouter();
  const { task_id } = router.query;
  const [showInput, setShowInput] = useState(false);
  const [submittedTasks, setSubmittedTasks] = useState<string[]>([]);
  const { resetMessages } = useMessageStore();
  const { messages } = useMessageStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchEngine, setSearchEngine] = useState<SearchEngine | null>(null);
  const { toast } = useToast();
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const idCode = Cookies.get('idCode');
    if (!idCode) {
      router.push('/');
      return;
    }

    // Check if topics are already stored in localStorage
    const storedTopics = Cookies.get('topics');
    if (storedTopics) {
      setTasks(JSON.parse(storedTopics));
    } else {
      const fetchTopics = async () => {
        try {
          const data = await loadTopics(idCode);
          if (data.topics) {
            setTasks(data.topics);
            // Store the topics in localStorage
            Cookies.set('topics', JSON.stringify(data.topics));
          } else {
            throw new Error(data.error || 'Failed to load topics.');
          }
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };

      fetchTopics();
    }

    // Check if search engine info is already stored in localStorage
    const storedSearchEngine = Cookies.get('searchEngine');
    if (storedSearchEngine) {
      setSearchEngine(JSON.parse(storedSearchEngine));
    } else {
      const fetchSearchEngine = async () => {
        try {
          const data = await loadSearchEngine(idCode);
          if (data.search_engine) {
            setSearchEngine(data.search_engine);
            // Store the search engine info in localStorage
            Cookies.set('searchEngine', JSON.stringify(data.search_engine));
            if (data.search_engine.type === 'ChatNoir') {
              Cookies.set('ChatNoirIndex', data.search_engine.index);
            }

          } else {
            throw new Error(data.error || 'Failed to load search engine info.');
          }
        } catch (error) {
          console.error('Error fetching search engine info:', error);
        }
      };

      fetchSearchEngine();
    }
  }, [router]);

  useEffect(() => {
    // This effect runs when `task_id` or `tasks` changes.
    const task = tasks.find(t => t.id === task_id);
    setCurrentTask(task);

    // If a task is found, store its id in a cookie
    if (task) {
      Cookies.set('currentTask', task.task_id.toString());
    }
  }, [task_id, tasks]);

  useEffect(() => {
    // Function to check for taskInProgress changes
    const checkTaskInProgress = () => {
      const storedTaskInProgress = Cookies.get('taskInProgress') === 'true';
      if (storedTaskInProgress !== taskInProgress) {
        setTaskInProgress(storedTaskInProgress);
      }
    };

    // Set an interval to check for changes
    const intervalId = setInterval(checkTaskInProgress, 1000); // Check every second

    // Initial check
    checkTaskInProgress();

    // Cleanup interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [taskInProgress]);

  useEffect(() => {

    // Function to log user activity
    const logUserActivity = async (action: string) => {
      const userId = Cookies.get('user_id') || 'unknown_user';
      const currentQuery = Cookies.get('currentQuery') || 'unknown_query';
      const taskId = Cookies.get('currentTask') || 'unknown_task';

      await logUserAction({
        user_id: userId,
        task_id: taskId,
        action: action,
        query: currentQuery,
        content: `INFO: User has ${action === 'JUMP_IN' ? 'returned to' : 'left'} the active window`,
        timestamp: Math.floor(new Date().getTime() / 1000),
      });
    };

    // Event listener for visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logUserActivity('JUMP_OUT');
      } else if (document.visibilityState === 'visible') {
        logUserActivity('JUMP_IN');
      }
    };

    // Add event listener for tracking tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleEndTaskClick = () => {
    setShowInput(!showInput);
  };

  const handleCancelClick = () => {
    setShowInput(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const taskIdAsString = String(task_id);
    const newSubmittedTasks = [...submittedTasks, taskIdAsString];
    setSubmittedTasks(newSubmittedTasks);
    setShowInput(false);
    resetMessages();
    const currentIndex = tasks.findIndex(task => task.id === taskIdAsString);
    const nextTask = tasks[currentIndex + 1];

    // Prepare data for logging
    const userId = Cookies.get('user_id') || 'unknown_user';
    const currentQuery = Cookies.get('currentQuery') || 'unknown_query';
    const taskId = Cookies.get('currentTask') || 'unknown_task';
    const userTypedText = userAnswer;

    // Log the Submit Task event
    await logUserAction({
      user_id: userId,
      task_id: taskId,
      action: 'SUBMIT_TASK',
      query: currentQuery,
      content: `INFO: User has submitted an answer for task ${taskId} with the following text: "${userTypedText}".`,
      timestamp: Math.floor(new Date().getTime() / 1000),
    });

    if (nextTask) {
      router.push(`/tasks?task_id=${nextTask.id}`);
    } else {
      router.push('/end_session');
    }

    const newTaskInProgressStatus = !taskInProgress;
    setTaskInProgress(newTaskInProgressStatus);
    Cookies.set('taskInProgress', newTaskInProgressStatus.toString());
    Cookies.set('submittedTasks', JSON.stringify(newSubmittedTasks));
  };

  return (
    <div style={{ position: 'relative', paddingTop: '60px' }}>
      <div className="flex justify-center gap-4 top-20-sm" style={{ position: 'absolute', width: '80%', left: '10%', top: '60px', zIndex: 1000 }}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`cursor-pointer rounded-full w-8 h-8 flex items-center justify-center ${submittedTasks.includes(task.id) ? 'bg-green-500' : task.id === task_id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              if (!submittedTasks.includes(task.id)) {
                if (!taskInProgress) {
                  router.push(`/tasks?task_id=${task.id}`);
                } else {
                  toast({
                    title: "Action not allowed",
                    description: "Please end the current task before moving to the next one.",
                    variant: "destructive",
                  });
                }
              }
            }}
          >
            {submittedTasks.includes(task.id) ? '✓' : index + 1}
          </div>
        ))}
      </div>
      <div className="text-center mt-10 bg-card w-full sm:w-1/3 mx-auto p-5">
        <h1 className="text-2xl mb-4">{currentTask?.title}</h1>
        <span className="text-l mb-4">{currentTask?.description}</span>
      </div>
      <div className="text-center">
        {!submittedTasks.includes(task_id as string) && (
          <>
            {showInput ? (
              <form onSubmit={handleSubmit} className="text-center w-full sm:w-35/100 mx-auto rounded-2xl p-2 sm:p-5" style={{ borderRadius: '8px' }}>
                <textarea
                  placeholder="Provide your answer or search narrative (optional)"
                  // required
                  className="input-answer py-2 px-4 text-lg"
                  style={{ display: 'block', width: 'calc(100% - 8px)', height: '100px', margin: '0 auto', marginBottom: '20px', resize: 'vertical' }}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <button type="submit" className="py-2 px-10 bg-blue-500 text-white rounded-full text-lg mr-2">Submit</button>
                  <button type="button" onClick={handleCancelClick} className="py-2 px-10 bg-gray-500 text-white rounded-full text-lg">Cancel</button>
                </div>
              </form>
            ) : (
              messages.length > 0 && (
                <button type="submit" className="py-2 px-20 bg-blue-500 text-white rounded-full text-lg mt-2" onClick={handleEndTaskClick}>End Task</button>
              )
            )}
          </>
        )}
      </div>
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <ChatPanel taskType={currentTask?.taskType} searchEngineType={searchEngine?.type} />
      </div>
    </div>
  );
}
