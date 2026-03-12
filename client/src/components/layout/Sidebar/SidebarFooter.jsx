import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as userAPI from '../../../api/user';
import { Settings, LogOut } from './icons/sidebarIcons';

const SidebarFooter = ({ user, isExpanded, showMenu, onProfileClick, onLogout, onOpenSettings }) => {
  const { updateUser } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(user?.status || 'Online');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update current status when user prop changes
  useEffect(() => {
    setCurrentStatus(user?.status || 'Online');
  }, [user?.status]);

  // Status configuration - pure color dots
  const statusConfig = {
    'Online': { color: 'bg-green-500', label: 'Online' },
    'away': { color: 'bg-orange-500', label: 'Away' },
    'do not disturb': { color: 'bg-red-500', label: 'Do Not Disturb' },
    'invisible': { color: 'bg-gray-500', label: 'Invisible' }
  };

  const statusList = ['Online', 'away', 'do not disturb', 'invisible'];

  const handleStatusChange = async (status) => {
    setIsUpdating(true);
    try {
      const response = await userAPI.updateProfile({ status });
      updateUser({ ...user, status });
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert UI
      setCurrentStatus(user?.status);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get user display info
  const hasDisplayName = user?.display_name !== null && user?.display_name !== undefined;
  const displayName = user?.display_name || user?.username || 'User';
  const username = user?.username || '';
  const avatarUrl = user?.profile_picture;
  const userRole = user?.role;
  const statusInfo = statusConfig[currentStatus] || statusConfig['Online'];

  // Role display configuration
  const getRoleConfig = (role) => {
    switch (role) {
      case 'founder':
        return { label: 'Founder', cssClass: 'role-badge role-badge-founder' };
      case 'admin':
        return { label: 'Administrator', cssClass: 'role-badge role-badge-admin' };
      case 'moderator':
        return { label: 'Moderator', cssClass: 'role-badge role-badge-moderator' };
      default:
        return null;
    }
  };

  const roleConfig = getRoleConfig(userRole);
  const shouldShowRole = roleConfig !== null;

  return (
    <div className="border-t border-gray-200 p-4 relative">
      {/* Role Badge */}
      {shouldShowRole && isExpanded && (
        <div className="mb-2 flex justify-center">
          <span className={roleConfig.cssClass}>
            {roleConfig.label}
          </span>
        </div>
      )}
      <div 
        className="
          flex items-center rounded-full cursor-pointer transition-all duration-200
          px-2 py-2
        "
        onClick={onProfileClick}
      >
        {/* Profile Picture with Status Indicator */}
        <div className="flex-shrink-0 relative">
          <div className={`w-10 h-10 rounded-full overflow-hidden border-3 ${statusInfo.color.replace('bg-', 'border-')} border-opacity-75`}>
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/default-avatar.webp';
              }}
            />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusInfo.color} border-2 border-white`} />
        </div>

        {/* User Info */}
        {isExpanded && (
          <div className="ml-3">
            {hasDisplayName ? (
              <>
                <p className="text-sm font-medium text-black truncate">
                  {user.display_name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  @{username}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-black truncate">
                {username}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Dropdown Menu */}
      {showMenu && (
        <div className={`
          ${isExpanded 
            ? 'absolute bottom-full left-4 right-4 mb-2' 
            : 'fixed left-[90px] bottom-4 w-48'
          } bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50
        `}>
          {/* Direct Status Items - No "Set Status" button */}
          {statusList.map((status) => {
            const info = statusConfig[status];
            const isActive = status === currentStatus;
            return (
              <button
                key={status}
                onClick={() => {
                  handleStatusChange(status);
                  onProfileClick();
                }}
                disabled={isUpdating}
                className={`
                  w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0
                  ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : ''}
                `}
              >
                <div className={`w-3 h-3 rounded-full ${info.color} flex-shrink-0 mr-3`} />
                <span className="text-sm capitalize">{info.label}</span>
                {isUpdating && status === currentStatus && <div className="ml-auto w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              </button>
            );
          })}

          {/* Settings */}
          <button
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              onProfileClick();
            }}
            className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} className="text-[#1E90FF]" />
            <span className="ml-3 text-sm font-medium">Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              onLogout();
              onProfileClick();
            }}
            className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <LogOut size={18} className="text-red-500" />
            <span className="ml-3 text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarFooter;

