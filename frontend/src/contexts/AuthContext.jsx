import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api'; // Import the api instance

export const AuthContext = createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
                if (isExpired) {
                    // Auto-clear expired token silently
                    localStorage.removeItem('jwt');
                    setUser(null);
                } else {
                    setUser(decoded.data);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (e) {
                // Malformed token — clear it
                localStorage.removeItem('jwt');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('jwt', token);
        const decoded = jwtDecode(token);
        setUser(decoded.data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set on the custom api instance too
    };

    const logout = () => {
        localStorage.removeItem('jwt');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        delete api.defaults.headers.common['Authorization']; // Remove from custom api instance too
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
