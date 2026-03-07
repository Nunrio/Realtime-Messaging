
import axiosInstance from './axios';

export const getGroups = async () => {
    const response = await axiosInstance.get('/groups');
    return response.data;
};

export const getUserGroups = async () => {
    const response = await axiosInstance.get('/groups/my');
    return response.data;
};

export const getGroup = async (groupId) => {
    const response = await axiosInstance.get(`/groups/${groupId}`);
    return response.data;
};

export const createGroup = async (groupName) => {
    const response = await axiosInstance.post('/groups', { group_name: groupName });
    return response.data;
};

export const joinGroup = async (groupId) => {
    const response = await axiosInstance.post(`/groups/${groupId}/join`);
    return response.data;
};

export const leaveGroup = async (groupId) => {
    const response = await axiosInstance.post(`/groups/${groupId}/leave`);
    return response.data;
};

export const getGroupMembers = async (groupId) => {
    const response = await axiosInstance.get(`/groups/${groupId}/members`);
    return response.data;
};

