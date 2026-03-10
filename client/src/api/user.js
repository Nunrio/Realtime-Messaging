import axiosInstance from './axios';

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/users/profile', profileData);
  return response.data;
};

/**
 * Verify current password
 * @param {string} currentPassword - Current password to verify
 * @returns {Promise<Object>} - Success response
 */
export const verifyCurrentPassword = async (currentPassword) => {
  const response = await axiosInstance.post('/users/verify-password', { currentPassword });
  return response.data;
};

/**
 * Update user password
 * @param {Object} passwords - New password
 * @returns {Promise<Object>} - Response message
 */
export const updatePassword = async (passwords) => {
  const response = await axiosInstance.put('/users/password', passwords);
  return response.data;
};

/**
 * Upload profile picture
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} - Updated profile picture URL
 */
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await axiosInstance.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ==================== Admin API Calls ====================

/**
 * Get all users with optional filters
 * @param {Object} params - Search and filter params
 * @returns {Promise<Object>} - List of users
 */
export const getAllUsers = async (params = {}) => {
  const response = await axiosInstance.get('/admin/users', { params });
  return response.data;
};

/**
 * Get single user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Mute a user
 * @param {number} userId - User ID to mute
 * @param {string|null} mutedUntil - Optional mute expiration
 * @returns {Promise<Object>} - Success response
 */
export const muteUser = async (userId, mutedUntil = null) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/mute`, { mutedUntil });
  return response.data;
};

/**
 * Unmute a user
 * @param {number} userId - User ID to unmute
 * @returns {Promise<Object>} - Success response
 */
export const unmuteUser = async (userId) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/unmute`);
  return response.data;
};

/**
 * Ban a user
 * @param {number} userId - User ID to ban
 * @param {string|null} reason - Optional ban reason
 * @returns {Promise<Object>} - Success response
 */
export const banUser = async (userId, reason = null) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/ban`, { reason });
  return response.data;
};

/**
 * Unban a user
 * @param {number} userId - User ID to unban
 * @returns {Promise<Object>} - Success response
 */
export const unbanUser = async (userId) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/unban`);
  return response.data;
};

/**
 * Change user role
 * @param {number} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} - Success response
 */
export const changeUserRole = async (userId, role) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Archive a user
 * @param {number} userId - User ID to archive
 * @returns {Promise<Object>} - Success response
 */
export const archiveUser = async (userId) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/archive`);
  return response.data;
};

/**
 * Unarchive a user
 * @param {number} userId - User ID to unarchive
 * @returns {Promise<Object>} - Success response
 */
export const unarchiveUser = async (userId) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/unarchive`);
  return response.data;
};

