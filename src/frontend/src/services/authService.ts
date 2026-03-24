import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
    id: number;
    github_id: number;
    username: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
}

export interface AuthStatus {
    authenticated: boolean;
    user?: User;
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for sending cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginWithGithub = () => {
    window.location.href = `${API_URL}/api/v1/auth/github`;
};

export const checkAuthStatus = async (): Promise<AuthStatus> => {
    try {
        const response = await api.get<AuthStatus>('/api/v1/auth/me');
        return response.data;
    } catch (error) {
        return { authenticated: false };
    }
};

export const logout = async (): Promise<void> => {
    await api.post('/api/v1/auth/logout');
};
