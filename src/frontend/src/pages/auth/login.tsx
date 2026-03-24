import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const { signIn, authenticated, loading, checkAuth } = useAuth();
    const router = useRouter();

    // Always re-check auth when landing on login page — handles the case
    // where user was redirected here after an OAuth callback cookie race.
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (authenticated) {
            router.replace('/dashboard');
        }
    }, [authenticated, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-foreground tracking-tight">
                        Welcome to UXLab
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Sign in to access the Experimenter Dashboard and manage your user studies.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <button
                        onClick={signIn}
                        className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#24292e] hover:bg-[#2c3137] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </span>
                        Continue with GitHub
                    </button>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                    <p className="text-center text-xs text-muted-foreground">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
