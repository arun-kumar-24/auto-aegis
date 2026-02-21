import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // On mount, fetch current user if token exists
    useEffect(() => {
        if (!token) { setLoading(false); return; }
        api.get('/auth/me')
            .then((res) => setUser(res.data.user))
            .catch((err) => {
                const status = err?.response?.status;
                // Only wipe token on a genuine auth failure (401).
                // Transient chaos errors (5xx, network) must NOT log the user out.
                if (status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            })
            .finally(() => setLoading(false));
    }, [token]);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        toast.success(`Welcome back, ${newUser.name}!`);
        return newUser;
    }, []);

    const signup = useCallback(async (name, email, password) => {
        const res = await api.post('/auth/signup', { name, email, password });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        toast.success('Account created!');
        return newUser;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        toast('Logged out.', { icon: '👋' });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
    return ctx;
}
