import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SidebarHeader from './SidebarHeader';
import SidebarItems from './SidebarItems';
import SidebarFooter from './SidebarFooter';
import './Sidebar.css';

const Sidebar = ({ onOpenSettings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState('chats');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Determine active item based on current route
  useEffect(() => {
    const path = location.pathname;
    // Check more specific paths first
    if (path.startsWith('/messages/groups')) {
      setActiveItem('groups');
    } else if (path.startsWith('/messages/archive')) {
      setActiveItem('archive');
    } else if (path.startsWith('/messages') || path.startsWith('/chat') || path.startsWith('/room')) {
      setActiveItem('chats');
    }
  }, [location.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    
    // Navigate based on item - using new messaging page
    switch (itemId) {
      case 'chats':
        navigate('/messages');
        break;
      case 'groups':
        navigate('/messages/groups');
        break;
      case 'archive':
        navigate('/messages/archive');
        break;
      default:
        break;
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };

    if (showLogoutModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal]);

  return (
    <div 
      ref={sidebarRef}
      className={`sidebar ${isExpanded ? 'sidebar--expanded' : 'sidebar--collapsed'}`}
    >
      {/* Header */}
      <SidebarHeader 
        isExpanded={isExpanded} 
        onToggle={toggleSidebar} 
      />

      {/* Navigation Items */}
      <SidebarItems 
        activeItem={activeItem}
        isExpanded={isExpanded}
        onItemClick={handleItemClick}
      />

      {/* Footer - User Profile */}
      <SidebarFooter 
        user={user}
        isExpanded={isExpanded}
        showMenu={showProfileMenu}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onOpenSettings={onOpenSettings}
      />

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

export default Sidebar;
