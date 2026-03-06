import axios from './axios';

export const getMessages = async (roomId, page = 1) => {
    const response = await axios.get(`/rooms/${roomId}/messages?page=${page}`);
    return response.data;
};

export const getMessageReactions = async (messageId) => {
    const response = await axios.get(`/messages/${messageId}/reactions`);
    return response.data;
};

