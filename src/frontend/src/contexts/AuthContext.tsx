import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AuthStatus, User, checkAuthStatus, logout, loginWithGithub } from '../services/authService';

interface AuthContextType {
    authenticated: boolean;
    loading: boolean;
    user: User | undefined;
    checkAuth: () => Promise<void>;
    signOut: () => Promise<void>;
    signIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const status = await checkAuthStatus();
            setAuthenticated(status.authenticated);
            setUser(status.user);

            // If first check fails, retry once after a short delay
            // (handles race between cookie being set and the check)
            if (!status.authenticated) {
                await new Promise((r) => setTimeout(r, 500));
                const retry = await checkAuthStatus();
                setAuthenticated(retry.authenticated);
                setUser(retry.user);
            }
        } catch (error) {
            setAuthenticated(false);
            setUser(undefined);
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = async () => {
        await logout();
        setAuthenticated(false);
        setUser(undefined);
    };

    const signIn = () => {
        loginWithGithub();
    };

    // Check auth on initial mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Re-check auth when navigating to dashboard (handles OAuth callback redirect)
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            if (url.startsWith('/dashboard') && !authenticated) {
                checkAuth();
            }
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => router.events.off('routeChangeComplete', handleRouteChange);
    }, [router, authenticated, checkAuth]);

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                loading,
                user,
                checkAuth,
                signOut,
                signIn,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
