import React from 'react';
import { Settings, LogOut } from './icons/sidebarIcons';

const SidebarFooter = ({ user, isExpanded, showMenu, onProfileClick, onLogout, onOpenSettings }) => {
  // Get user display info
  const hasDisplayName = user?.display_name !== null && user?.display_name !== undefined;
  const displayName = user?.display_name || user?.username || 'User';
  const username = user?.username || '';
  const avatarUrl = user?.profile_picture;
  const userRole = user?.role;

  // Role display configuration
  const getRoleConfig = (role) => {
    switch (role) {
      case 'founder':
        return { label: 'Founder', bgColor: '#00008B', textColor: '#FFFFFF' };
      case 'admin':
        return { label: 'Administrator', bgColor: '#8B0000', textColor: '#FFFFFF' };
      case 'moderator':
        return { label: 'Moderator', bgColor: '#FF6B6B', textColor: '#FFFFFF' };
      default:
        return null;
    }
  };

  const roleConfig = getRoleConfig(userRole);
  const shouldShowRole = roleConfig !== null;

  return (
    <div className="border-t border-gray-200 p-4 relative">
      {/* Role Badge - Only show for Founder, Administrator, Moderator */}
      {shouldShowRole && isExpanded && (
        <div className="mb-2 flex justify-center">
          <span 
            className="inline-block px-2 py-1 text-xs font-semibold rounded-md"
            style={{ backgroundColor: roleConfig.bgColor, color: roleConfig.textColor }}
          >
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
        {/* Column 1 - Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1E90FF]">
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/default-avatar.webp';
              }}
            />
          </div>
        </div>

        {/* Column 2 - User Info - Only show when expanded */}
        {isExpanded && (
          <div className="ml-3">
            {/* Show display name if it exists */}
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
              /* Only show username if display name is null (without @) */
              <p className="text-sm font-medium text-black truncate">
                {username}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dropdown Menu (Drop-up) */}
      {showMenu && (
        <div className={`${
          isExpanded 
            ? 'absolute bottom-full left-4 right-4 mb-2' 
            : 'fixed left-[90px] bottom-4 w-48'
        } bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50`}>
          <button
            onClick={() => {
              if (onOpenSettings) {
                onOpenSettings();
              }
              onProfileClick(); // Close menu
            }}
            className="w-full flex items-center px-4 py-3 text-black hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} className="text-[#1E90FF]" />
            <span className="ml-3 text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={() => {
              onLogout();
              onProfileClick(); // Close menu
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

