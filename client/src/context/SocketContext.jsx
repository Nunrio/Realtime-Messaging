import React, { createContext, useState, useEffect, useContext } from 'react';
import { initSocket, getSocket, disconnectSocket } from '../socket/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (isAuthenticated && token) {
            const socketInstance = initSocket(token);
            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                setConnected(true);
            });

            socketInstance.on('disconnect', () => {
                setConnected(false);
            });

            return () => {
                disconnectSocket();
            };
        } else {
            disconnectSocket();
            setSocket(null);
            setConnected(false);
        }
    }, [isAuthenticated, token]);

    const joinRoom = (roomId) => {
        if (socket) {
            socket.emit('join_room', { roomId });
        }
    };

    const leaveRoom = (roomId) => {
        if (socket) {
            socket.emit('leave_room', { roomId });
        }
    };

    const sendMessage = (roomId, message) => {
        if (socket) {
            socket.emit('send_message', { roomId, message });
        }
    };

    const sendTyping = (roomId, isTyping) => {
        if (socket) {
            socket.emit('typing', { roomId, isTyping });
        }
    };

    const addReaction = (messageId, reactionType) => {
        if (socket) {
            socket.emit('add_reaction', { messageId, reactionType });
        }
    };

    const removeReaction = (messageId, reactionType) => {
        if (socket) {
            socket.emit('remove_reaction', { messageId, reactionType });
        }
    };

    const updateNote = (roomId, content) => {
        if (socket) {
            socket.emit('update_note', { roomId, content });
        }
    };

    const value = {
        socket,
        connected,
        joinRoom,
        leaveRoom,
        sendMessage,
        sendTyping,
        addReaction,
        removeReaction,
        updateNote
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

