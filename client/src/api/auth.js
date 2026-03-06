import axiosInstance from './axios';

export const register = async (username, email, password) => {
    const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password
    });
    return response.data;
};

export const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
        email,
        password
    });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
};

