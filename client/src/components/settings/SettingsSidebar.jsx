import React, { useState } from 'react';
import { User, Share2, Bell, Search, LogOut, MessageCircle, Users, Archive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsSidebar = ({ activeSection, onSectionChange, user, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();

  const menuItems = [
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

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Get user display info
  const hasDisplayName = user?.display_name !== null && user?.display_name !== undefined;
  const displayName = user?.display_name || user?.username || 'User';
  const avatarUrl = user?.profile_picture;

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
      <nav className="flex-1 py-2 px-2">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
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
    </div>
  );
};

export default SettingsSidebar;

