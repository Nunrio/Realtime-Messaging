import React from 'react';
import MyAccount from './MyAccount';
import Socials from './Socials';
import Notifications from './Notifications';

const SettingsContent = ({ activeSection, user, onUnsavedChangesChange }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'my-account':
        return <MyAccount user={user} onUnsavedChangesChange={onUnsavedChangesChange} />;
      case 'socials':
        return <Socials />;
      case 'notifications':
        return <Notifications />;
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

