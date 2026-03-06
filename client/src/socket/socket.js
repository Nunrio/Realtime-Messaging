import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

