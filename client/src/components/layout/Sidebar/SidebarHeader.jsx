import React from 'react';
import { Menu, X } from './icons/sidebarIcons';

const SidebarHeader = ({ isExpanded, onToggle }) => {
  return (
    <div className={`flex items-center p-4 border-b border-gray-200 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
      {/* Icon Column - Toggle Button */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isExpanded ? 'bg-[#1E90FF]' : ''}`}>
        <button
          onClick={onToggle}
          className={`flex items-center justify-center ${isExpanded ? 'text-white' : 'text-[#1E90FF]'}`}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Title - Only show when expanded */}
      {isExpanded && (
        <span className="ml-3 text-lg font-semibold text-black whitespace-nowrap">
          Messaging
        </span>
      )}
    </div>
  );
};

export default SidebarHeader;

