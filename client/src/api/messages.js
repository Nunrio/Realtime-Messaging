import axios from './axios';

export const getMessages = async (groupId, page = 1) => {
    const response = await axios.get(`/${groupId}/messages?page=${page}`);
    return response.data;
};

export const getMessageReactions = async (messageId) => {
    const response = await axios.get(`/messages/${messageId}/reactions`);
    return response.data;
};
