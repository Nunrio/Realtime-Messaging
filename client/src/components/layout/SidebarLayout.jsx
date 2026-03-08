import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar/Sidebar';
import SettingsModal from '../settings/SettingsModal';

const SidebarLayout = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // If still loading auth state, don't render anything
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  // If not authenticated, children will be rendered anyway (ProtectedRoute handles redirect)
  // But we don't show sidebar for unauthenticated users
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user}
        hasUnsavedChanges={hasUnsavedChanges}
        onUnsavedChangesChange={setHasUnsavedChanges}
      />
    </div>
  );
};

export default SidebarLayout;

