import React from 'react';
import { Settings, LogOut } from './icons/sidebarIcons';

const SidebarFooter = ({ user, isExpanded, showMenu, onProfileClick, onLogout }) => {
  // Get user display info - show username if display_name is null
  const displayName = user?.display_name || user?.username || 'User';
  const username = user?.username || '';
  const avatarUrl = user?.avatar || '/images/default-avatar.webp';

  return (
    <div className="border-t border-gray-200 p-4 relative">
      {/* Profile Section */}
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
            <p className="text-sm font-medium text-black truncate">
              {displayName}
            </p>
            {username && (
              <p className="text-xs text-gray-600 truncate">
                @{username}
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
              // Future: Navigate to settings
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

