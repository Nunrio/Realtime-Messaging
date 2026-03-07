
import React from 'react';

const ConversationCard = ({ group, isSelected, onClick }) => {
  // Handle group_name
  const displayName = group.group_name || group.room_name || 'Unnamed Group';

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-3 cursor-pointer transition-colors duration-150
        ${isSelected 
          ? 'bg-[rgba(30,144,255,0.1)] border-l-4 border-[#1E90FF]' 
          : 'hover:bg-gray-100 border-l-4 border-transparent'
        }
      `}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getAvatarColor(displayName)} flex items-center justify-center text-white font-semibold`}>
        {getInitials(displayName)}
      </div>

      {/* Content */}
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-[#1E90FF]' : 'text-gray-900'}`}>
            {displayName}
          </h3>
          {group.last_message_time && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTimestamp(group.last_message_time)}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500 truncate">
            {group.last_message || (group.members_count !== undefined ? `${group.members_count} members` : 'No messages yet')}
          </p>
          
          {group.members_count !== undefined && (
            <span className="ml-2 flex-shrink-0 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {group.members_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;

