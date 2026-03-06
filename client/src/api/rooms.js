import axiosInstance from './axios';

export const getRooms = async () => {
    const response = await axiosInstance.get('/rooms');
    return response.data;
};

export const getUserRooms = async () => {
    const response = await axiosInstance.get('/rooms/my');
    return response.data;
};

export const getRoom = async (roomId) => {
    const response = await axiosInstance.get(`/rooms/${roomId}`);
    return response.data;
};

export const createRoom = async (roomName) => {
    const response = await axiosInstance.post('/rooms', { room_name: roomName });
    return response.data;
};

export const joinRoom = async (roomId) => {
    const response = await axiosInstance.post(`/rooms/${roomId}/join`);
    return response.data;
};

export const leaveRoom = async (roomId) => {
    const response = await axiosInstance.post(`/rooms/${roomId}/leave`);
    return response.data;
};

export const getRoomMembers = async (roomId) => {
    const response = await axiosInstance.get(`/rooms/${roomId}/members`);
    return response.data;
};

