import React, { createContext, useContext, useEffect, useState } from 'react';
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

    const checkAuth = async () => {
        try {
            setLoading(true);
            const status = await checkAuthStatus();
            setAuthenticated(status.authenticated);
            setUser(status.user);
        } catch (error) {
            setAuthenticated(false);
            setUser(undefined);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await logout();
        setAuthenticated(false);
        setUser(undefined);
    };

    const signIn = () => {
        loginWithGithub();
    };

    useEffect(() => {
        checkAuth();
    }, []);

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
