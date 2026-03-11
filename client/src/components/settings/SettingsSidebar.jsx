import React, { useState } from 'react';
import { User, Share2, Bell, Search, LogOut, MessageCircle, Users, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsSidebar = ({ activeSection, onSectionChange, user, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Admin settings menu items
  const adminMenuItems = [
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: Shield,
      adminOnly: true,
    },
  ];

  // User settings menu items
  const userMenuItems = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: User,
    },
    {
      id: 'socials',
      label: 'Socials',
      icon: Share2,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
    },
  ];

  // Filter items based on search query
  const filteredAdminItems = adminMenuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredUserItems = userMenuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Get user display info
  const hasDisplayName = user?.display_name !== null && user?.display_name !== undefined;
  const displayName = user?.display_name || user?.username || 'User';
  const avatarUrl = user?.profile_picture;
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'founder';

  return (
    <div className="flex flex-col h-full">
      {/* Header - Reusing sidebar header style */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1E90FF] flex items-center justify-center">
          <MessageCircle size={20} className="text-white" />
        </div>
        <span className="ml-3 text-lg font-semibold text-black whitespace-nowrap">
          Settings
        </span>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1E90FF]">
              <img 
                src={avatarUrl || '/images/default-avatar.webp'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/default-avatar.webp';
                }}
              />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-black truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-600 truncate">
              @{user?.username}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {/* Admin Settings Section */}
        {isAdmin && (
          <>
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin Settings
              </span>
            </div>
            <ul className="space-y-1 mb-2">
              {filteredAdminItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSectionChange(item.id)}
                      className={`
                        flex items-center w-full rounded-lg px-4 py-3 transition-colors
                        ${isActive 
                          ? 'bg-[rgba(30,144,255,0.1)]' 
                          : 'hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-[#1E90FF]' : 'bg-gray-100'}`}>
                        <Icon 
                          size={20} 
                          className={isActive ? 'text-white' : 'text-gray-600'} 
                        />
                      </div>
                      <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-[#1E90FF]' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>
          </>
        )}

        {/* User Settings Section */}
        <div className="px-4 py-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            User Settings
          </span>
        </div>
        <ul className="space-y-1">
          {filteredUserItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    flex items-center w-full rounded-lg px-4 py-3 transition-colors
                    ${isActive 
                      ? 'bg-[rgba(30,144,255,0.1)]' 
                      : 'hover:bg-gray-100'
                    }
                  `}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-[#1E90FF]' : 'bg-gray-100'}`}>
                    <Icon 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-gray-600'} 
                    />
                  </div>
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-[#1E90FF]' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-50">
            <LogOut size={20} className="text-red-500" />
          </div>
          <span className="ml-3 text-sm font-medium whitespace-nowrap">
            Logout
          </span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-xl font-bold mb-2 text-gray-900">Log Out</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSidebar;

