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

