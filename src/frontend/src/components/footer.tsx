import { useRouter } from 'next/router';
import { Button } from "./ui/button";
import Swal from 'sweetalert2';
import { logUserAction } from "../services/apiService";
import Cookies from 'js-cookie';

export function Footer() {
  const router = useRouter();

  const isTasksPage = router.pathname === '/tasks';

  const handleEndSessionClick = () => {
    const externalCookie = Cookies.get('external');
    const submittedTasksJson = Cookies.get('submittedTasks') || '[]';
    const submittedTasks = JSON.parse(submittedTasksJson);

    if (externalCookie && externalCookie === 'PROLIFIC' && submittedTasks.length < 6) {
      // Notify the user that they have remaining tasks
      Swal.fire({
        title: 'Tasks Remaining',
        text: `You have ${6 - submittedTasks.length} tasks remaining to finish the user study.`,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
    } else {
      Swal.fire({
        title: 'Confirmation',
        text: 'Are you sure you want to end the user study? Please note that this action is irreversible, and your results will be submitted anonymously.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, end it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Prepare data for logging
          const userId = Cookies.get('user_id') || 'unknown_user';
          const currentQuery = Cookies.get('currentQuery') || 'unknown_query';
          const taskId = Cookies.get('currentTask') || 'unknown_task';

          // Log the End User Study event
          await logUserAction({
            user_id: userId,
            task_id: taskId,
            action: 'SEARCH_END',
            query: currentQuery,
            content: 'INFO: User has ended the study session',
            timestamp: Math.floor(new Date().getTime() / 1000),
          });

          // Clear localStorage and redirect
          Cookies.remove('topics');
          Cookies.remove('user_id');
          Cookies.remove('idCode');
          Cookies.remove('searchEngine');
          Cookies.remove('taskInProgress');
          Cookies.remove('submittedTasks');
          Cookies.remove('currentQuery');
          Cookies.remove('currentTask');
          Cookies.remove('hasActiveQuery');
          Cookies.remove('ChatNoirIndex');
          router.push('/end_session');
        }
      });
    }
  };



  return (
    isTasksPage ? (
      <footer className="w-full flex fixed bottom-0 right-0 p-1 z-50 bg-transparent">
        <div className="px-1 w-full flex flex-row justify-end">
          <Button
            variant="ghost"
            type="submit"
            className="py-6 px-20 mb-5 mr-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-lg mt-4"
            onClick={handleEndSessionClick}
          >
            End User Study
          </Button>
        </div>
      </footer>
    ) : null
  );
}