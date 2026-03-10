import React from 'react';
import { Bell, MessageCircle, AtSign, UserPlus, Volume2 } from 'lucide-react';

const Notifications = () => {
  const notificationSettings = [
    {
      id: 'message-notifications',
      title: 'Message Notifications',
      description: 'Receive notifications for new messages',
      icon: MessageCircle,
      enabled: true, // Placeholder
    },
    {
      id: 'mentions',
      title: 'Mentions',
      description: 'Get notified when someone mentions you',
      icon: AtSign,
      enabled: true, // Placeholder
    },
    {
      id: 'friend-requests',
      title: 'Friend Requests',
      description: 'Notifications for new friend requests',
      icon: UserPlus,
      enabled: true, // Placeholder
    },
    {
      id: 'sound-alerts',
      title: 'Sound Alerts',
      description: 'Play sound for notifications',
      icon: Volume2,
      enabled: false, // Placeholder
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
<h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Manage your notification preferences</p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Bell size={48} className="mx-auto text-blue-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Notification settings feature is under development. Check back later!
        </p>
      </div>

      {/* Future Implementation Preview */}
      <div className="mt-8">
<h2 className="text-base font-semibold text-gray-900 mb-4">Future Features</h2>
        <div className="space-y-4">
          {notificationSettings.map((setting) => {
            const Icon = setting.icon;
            return (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Icon size={20} className="text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{setting.title}</p>
                    <p className="text-xs text-gray-400">{setting.description}</p>
                  </div>
                </div>
                {/* Toggle switch placeholder */}
                <div className={`w-12 h-6 rounded-full p-1 ${setting.enabled ? 'bg-[#1E90FF]' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

