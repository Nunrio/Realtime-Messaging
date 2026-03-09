import React from 'react';
import MyAccount from './MyAccount';
import Socials from './Socials';
import Notifications from './Notifications';
import ManageUsers from './ManageUsers';

const SettingsContent = ({ activeSection, user, onUnsavedChangesChange }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'my-account':
        return <MyAccount user={user} onUnsavedChangesChange={onUnsavedChangesChange} />;
      case 'socials':
        return <Socials />;
      case 'notifications':
        return <Notifications />;
      case 'manage-users':
        return <ManageUsers />;
      default:
        return <MyAccount user={user} onUnsavedChangesChange={onUnsavedChangesChange} />;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default SettingsContent;

