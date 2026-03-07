import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SidebarHeader from './SidebarHeader';
import SidebarItems from './SidebarItems';
import SidebarFooter from './SidebarFooter';
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState('chats');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
      />
    </div>
  );
};

export default Sidebar;
