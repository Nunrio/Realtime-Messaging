import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authAPI from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await authAPI.getCurrentUser();
                    setUser(response.user);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return response;
    };

    const register = async (username, email, password) => {
        const response = await authAPI.register(username, email, password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setToken(response.token);
        setUser(response.user);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

