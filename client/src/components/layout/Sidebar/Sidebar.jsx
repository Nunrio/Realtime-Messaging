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
    if (path.startsWith('/chat') || path.startsWith('/room')) {
      setActiveItem('chats');
    } else if (path.startsWith('/groups')) {
      setActiveItem('groups');
    } else if (path.startsWith('/archive')) {
      setActiveItem('archive');
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
    
    // Navigate based on item - for now only chats has a route
    switch (itemId) {
      case 'chats':
        navigate('/chat');
        break;
      case 'groups':
        // Future: navigate('/groups');
        break;
      case 'archive':
        // Future: navigate('/archive');
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

