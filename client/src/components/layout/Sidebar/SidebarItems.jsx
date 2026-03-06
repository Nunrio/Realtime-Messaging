import React from 'react';
import { MessageCircle, Users, Archive } from './icons/sidebarIcons';

const SidebarItems = ({ activeItem, isExpanded, onItemClick }) => {
  const items = [
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageCircle,
      path: '/chat'
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: Users,
      path: '/groups'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      path: '/archive'
    }
  ];

  return (
    <nav className="flex-1 py-4">
      <ul className="space-y-2 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={`
                  flex items-center rounded-full
                  ${isActive 
                    ? 'bg-[rgba(30,144,255,0.1)]' 
                    : 'hover:bg-[rgba(30,144,255,0.1)]'
                  }
                  px-4 py-3 w-full
                `}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Icon Column */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-[#1E90FF]' : ''}`}>
                  <Icon 
                    size={22} 
                    className={isActive ? 'text-white' : 'text-[#1E90FF]'} 
                  />
                </div>

                {/* Text Column - Only show when expanded */}
                {isExpanded && (
                  <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-[#1E90FF]' : 'text-black'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarItems;

