
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, AlertTriangle, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword, verifyCurrentPassword, uploadProfilePicture } from '../../api/user';
import { calculateAge } from '../../utils/dateUtils';
import Toast from '../toast/ToastService';

const MyAccount = ({ user, onUnsavedChangesChange }) => {
  const { setUser } = useAuth();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    gender: 'Prefer not to say',
    birthday: '',
    age: null,
    bio: '',
    profilePicture: '',
  });

  // Password change state - Step 1: Current password
  const [currentPassword, setCurrentPassword] = useState('');
  
  // Password change state - Step 2: New password modal
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shake, setShake] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordInputRef = useRef(null);

  // Trigger shake animation when password error changes
  useEffect(() => {
    if (passwordError) {
      setShake(true);
      // Remove shake class after animation completes
      const timer = setTimeout(() => {
        setShake(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [passwordError]);
  useEffect(() => {
    if (user) {
      // Format birthday for date input (ensure YYYY-MM-DD format)
      let formattedBirthday = '';
      if (user.birthday) {
        // Handle different date formats from database
        const dateObj = new Date(user.birthday);
        if (!isNaN(dateObj.getTime())) {
          formattedBirthday = dateObj.toISOString().split('T')[0];
        }
      }

      const initialData = {
        username: user.username || '',
        displayName: user.display_name || '',
        email: user.email || '',
        gender: user.gender || 'Prefer not to say',
        birthday: formattedBirthday,
        age: user.age || null,
        bio: user.bio || '',
        profilePicture: user.profile_picture || '',
        status: user.status || 'Online'
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  // Auto-calculate age when birthday changes or on initial load
  useEffect(() => {
    if (formData.birthday) {
      const calculatedAge = calculateAge(formData.birthday);
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    } else {
      setFormData(prev => ({ ...prev, age: null }));
    }
  }, [formData.birthday]);

  // Check for unsaved changes
  useEffect(() => {
    if (originalData) {
      const profileFields = ['displayName', 'gender', 'birthday', 'bio', 'profilePicture'];
      const hasChanges = profileFields.some(field => 
        formData[field] !== originalData[field]
      );
      setShowUnsavedWarning(hasChanges);
      // Notify parent component of unsaved changes
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(hasChanges);
      }
    }
  }, [formData, originalData, onUnsavedChangesChange]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  // Handle profile picture upload
  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      Toast.error('Only JPEG, JPG, PNG, WEBP, and GIF files are allowed');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Toast.error('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    try {
      const response = await uploadProfilePicture(file);
      const newProfilePicture = response.profile_picture;
      setFormData(prev => ({ ...prev, profilePicture: newProfilePicture }));
      Toast.success('Profile picture updated successfully');
      
      // Update auth context
      setUser(prev => ({ ...prev, profile_picture: newProfilePicture }));
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsLoading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  // Handle save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await updateProfile({
        display_name: formData.displayName,
        gender: formData.gender,
        birthday: formData.birthday || null,
        bio: formData.bio,
      });

      // Update local state with new data
      const updatedData = {
        ...formData,
        age: response.user.age,
      };
      setFormData(updatedData);
      setOriginalData(updatedData);
      setShowUnsavedWarning(false);

      // Update auth context
      setUser(prev => ({
        ...prev,
        display_name: response.user.display_name,
        gender: response.user.gender,
        birthday: response.user.birthday,
        age: response.user.age,
        bio: response.user.bio,
      }));

      Toast.success('Profile updated successfully');
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle verify current password - Step 1
  const handleVerifyPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    setIsVerifyingPassword(true);

    try {
      await verifyCurrentPassword(currentPassword);
      // If successful, open the modal for new password
      setShowPasswordModal(true);
      setCurrentPassword('');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Current password is incorrect');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle new password change - Step 2
  const handleNewPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords match
    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPasswordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsPasswordSaving(true);
    try {
      await updatePassword({
        newPassword: newPasswordData.newPassword,
        confirmPassword: newPasswordData.confirmPassword,
      });

      // Close modal and reset
      setShowPasswordModal(false);
      setNewPasswordData({ newPassword: '', confirmPassword: '' });
      Toast.success('Password updated successfully');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
<h1 className="text-lg font-bold text-gray-900">My Account</h1>
        <p className="text-gray-500 mt-1">Manage your profile information</p>
      </div>

      {/* Unsaved Changes Warning */}
      {showUnsavedWarning && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
          <AlertTriangle size={20} className="text-amber-500 mr-3" />
          <span className="text-amber-700">You have unsaved changes. Click "Save Changes" to save or your changes will be lost.</span>
        </div>
      )}

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="mb-8">
<h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div className="flex items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100">
              <img 
                src={formData.profilePicture || '/images/default-avatar.webp'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/default-avatar.webp';
                }}
              />
            </div>
            <button
              onClick={handleProfilePictureClick}
              disabled={isLoading}
              className="absolute bottom-0 right-0 p-2 bg-[#1E90FF] rounded-full text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Upload a new profile picture</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, JPG, PNG, WEBP, GIF • Max 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveProfile}>
        {/* Profile Info Section */}
        <div className="mb-8">
<h2 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Profile Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username - Display Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>

            {/* Display Name - Editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Enter your display name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              />
            </div>

            {/* Email - Display Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Account Security Section - Two Step Password Change */}
        <div className="mb-8">
<h2 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Account Security</h2>
          
          {/* Step 1: Enter current password */}
          <div className="flex items-start gap-4">
            <div className={`flex-1 ${shake ? 'animate-shake' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent ${shake ? 'border-red-500' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              )}
            </div>
            <div className="pt-7">
              <button
                type="button"
                onClick={handleVerifyPassword}
                disabled={isVerifyingPassword || !currentPassword}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
              >
                <Lock size={18} className="mr-2" />
                {isVerifyingPassword ? 'Verifying...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="mb-8">
<h2 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Personal Info</h2>
          
          {/* Birthday and Age Row */}
          <div className="flex gap-4 mb-6">
            {/* Birthday */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={(e) => {
                  const newBirthday = e.target.value;
                  setFormData(prev => {
                    const newData = { ...prev, birthday: newBirthday };
                    if (newBirthday) {
                      newData.age = calculateAge(newBirthday);
                    } else {
                      newData.age = null;
                    }
                    return newData;
                  });
                  setMessage({ type: '', text: '' });
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              />
            </div>

            {/* Age - Auto-calculated */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age || ''}
                readOnly
                placeholder="Auto-calculated"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          {/* Gender - Same width as Birthday/Age row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              >
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            {/* Empty div to match the Birthday/Age row width */}
            <div className="flex-1"></div>
          </div>

          {/* Bio - Full width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              maxLength={300}
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/300 characters</p>
          </div>
        </div>

        {/* Action Buttons - Floating at bottom when there are unsaved changes */}
        {showUnsavedWarning && (
          <div className="fixed bottom-6 right-6 z-10 flex gap-3 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <button
              type="button"
              onClick={() => {
                // Reset form to original values
                setFormData(originalData);
                setShowUnsavedWarning(false);
              }}
              disabled={isSaving}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-6 py-3 bg-[#1E90FF] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      {/* Password Change Modal - Step 2 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowPasswordModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
            {/* Close Button */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <p className="text-gray-500 mt-1">Enter your new password below</p>
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {passwordError}
              </div>
            )}

            {/* New Password Form */}
            <form onSubmit={handleNewPasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPasswordData.newPassword}
                      onChange={(e) => setNewPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={newPasswordData.confirmPassword}
                      onChange={(e) => setNewPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPasswordSaving || !newPasswordData.newPassword || !newPasswordData.confirmPassword}
                  className="px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordSaving ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;

