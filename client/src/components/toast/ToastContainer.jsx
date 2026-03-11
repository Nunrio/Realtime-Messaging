import React, { useEffect, useState, useCallback } from 'react';
import ToastItem from './ToastItem';
import './toast.css';

const MAX_TOASTS = 2;

/**
 * ToastContainer - Global toast container that listens for toast events
 * Should be mounted once in App.jsx at the root level
 * 
 * Listens for custom "toast" events dispatched by ToastService
 * Manages toast queue and renders ToastItem components
 */
const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    // Generate unique ID for each toast
    const generateId = () => {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Add a new toast to the queue (max 2 toasts)
    const addToast = useCallback((toastData) => {
        const { message, type, position } = toastData;
        const id = generateId();

        setToasts((prevToasts) => {
            // Limit to MAX_TOASTS total
            const updatedToasts = [...prevToasts, { id, message, type, position }];
            if (updatedToasts.length > MAX_TOASTS) {
                return updatedToasts.slice(-MAX_TOASTS);
            }
            return updatedToasts;
        });
    }, []);

    // Remove a toast from the queue
    const removeToast = useCallback((id) => {
        setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== id)
        );
    }, []);

    // Listen for toast events from ToastService
    useEffect(() => {
        const listener = (event) => {
            const { message, type, position } = event.detail;
            addToast({ message, type, position });
        };

        window.addEventListener('toast', listener);

        return () => {
            window.removeEventListener('toast', listener);
        };
    }, [addToast]);

    // Group toasts by position
    const authToasts = toasts.filter(t => t.position === 'auth');
    const centerToasts = toasts.filter(t => t.position !== 'auth');

    // Inline styles for position
    const authStyle = {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto',
        maxWidth: '400px',
        width: '100%',
        padding: '0 16px',
        zIndex: 9999
    };

    const centerStyle = {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto',
        maxWidth: '400px',
        width: '100%',
        padding: '0 16px',
        zIndex: 9999
    };

    return (
        <div className="toast-container-wrapper">
            {/* Auth position toasts (Login/Register pages) */}
            {authToasts.length > 0 && (
                <div style={authStyle}>
                    {authToasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                        />
                    ))}
                </div>
            )}

            {/* Center position toasts (Main app) */}
            {centerToasts.length > 0 && (
                <div style={centerStyle}>
                    {centerToasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToastContainer;

