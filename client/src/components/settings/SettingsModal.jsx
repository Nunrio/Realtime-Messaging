import React, { useEffect, useCallback, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import SettingsSidebar from './SettingsSidebar';
import SettingsContent from './SettingsContent';

const SettingsModal = ({ isOpen, onClose, user, hasUnsavedChanges, onUnsavedChangesChange }) => {
  const [activeSection, setActiveSection] = useState('my-account');
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // Handle Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (hasUnsavedChanges) {
        // Show shake effect and blocked message
        setShakeKey(prev => prev + 1);
        setShowBlockedMessage(true);
        setTimeout(() => setShowBlockedMessage(false), 3000);
      } else {
        onClose();
      }
    }
  }, [onClose, hasUnsavedChanges]);

  // Handle close button click
  const handleCloseClick = () => {
    if (hasUnsavedChanges) {
      // Show shake effect and blocked message
      setShakeKey(prev => prev + 1);
      setShowBlockedMessage(true);
      setTimeout(() => setShowBlockedMessage(false), 3000);
    } else {
      onClose();
    }
  };

  // Handle click outside (on overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (hasUnsavedChanges) {
        // Show shake effect and blocked message
        setShakeKey(prev => prev + 1);
        setShowBlockedMessage(true);
        setTimeout(() => setShowBlockedMessage(false), 3000);
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      {/* Overlay background with fade-in animation */}
      <div className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in" />
      
      {/* Modal container with scale-up animation and shake effect */}
      <div 
        key={shakeKey}
        className={`relative bg-white rounded-xl shadow-2xl w-[85vw] h-[85vh] max-w-6xl animate-scale-up overflow-hidden flex ${shakeKey > 0 ? 'animate-shake' : ''}`}
      >
        {/* Close button */}
        <button
          onClick={handleCloseClick}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close settings"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Blocked Message */}
        {showBlockedMessage && (
          <div className="absolute top-14 right-4 z-20 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center shadow-lg">
            <AlertTriangle size={16} className="text-red-500 mr-2" />
            <span className="text-sm text-red-700">Please save or cancel your changes first</span>
          </div>
        )}

        {/* Left Sidebar */}
        <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col">
          <SettingsSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            user={user}
            onClose={handleCloseClick}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <SettingsContent 
            activeSection={activeSection}
            user={user}
            onUnsavedChangesChange={onUnsavedChangesChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

