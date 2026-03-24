import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Legacy /tasks page — no longer functional.
 * Redirects to the homepage where participants can join studies
 * through the new participant-view flow.
 */
export default function TasksRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to the study portal...</p>
      </div>
    </div>
  );
}
