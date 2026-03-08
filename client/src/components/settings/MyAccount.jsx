import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword, uploadProfilePicture } from '../../api/user';
import { calculateAge } from '../../utils/dateUtils';

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

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const initialData = {
        username: user.username || '',
        displayName: user.display_name || '',
        email: user.email || '',
        gender: user.gender || 'Prefer not to say',
        birthday: user.birthday || '',
        age: user.age || null,
        bio: user.bio || '',
        profilePicture: user.profile_picture || '',
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user]);

  // Auto-calculate age when birthday changes
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
      const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
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

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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
      setMessage({ type: 'error', text: 'Only JPEG, JPG, PNG, WEBP, and GIF files are allowed' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await uploadProfilePicture(file);
      const newProfilePicture = response.profile_picture;
      setFormData(prev => ({ ...prev, profilePicture: newProfilePicture }));
      setMessage({ type: 'success', text: 'Profile picture updated successfully' });
      
      // Update auth context
      setUser(prev => ({ ...prev, profile_picture: newProfilePicture }));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload profile picture' });
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

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsPasswordSaving(true);
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Profile Info</h2>
          
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

        {/* Account Security Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Account Security</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              />
            </div>

            {/* Change Password Button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handlePasswordChangeSubmit}
                disabled={isPasswordSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPasswordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender */}
            <div>
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

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
              />
            </div>

            {/* Age - Auto-calculated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age || ''}
                readOnly
                placeholder="Auto-calculated from birthday"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Automatically calculated from birthday</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
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
    </div>
  );
};

export default MyAccount;

