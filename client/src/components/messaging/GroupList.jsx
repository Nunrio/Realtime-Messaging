import React from 'react';
import { MessageCircle, Users, Archive, Plus } from 'lucide-react';
import ConversationCard from './ConversationCard';

const GroupList = ({ 
  activeCategory, 
  onCategoryChange, 
  groups, 
  archivedGroups, 
  selectedId, 
  onSelectGroup,
  onCreateGroup 
}) => {
  // Category labels mapping
  const categoryLabels = {
    chats: 'Chats',
    groups: 'Groups',
    archive: 'Archive'
  };

  // Category icons mapping
  const categoryIcons = {
    chats: MessageCircle,
    groups: Users,
    archive: Archive
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'chats':
      case 'groups':
        return (
          <div className="space-y-1">
            {groups && groups.length > 0 ? (
              groups.map((group) => (
                <ConversationCard
                  key={group.id}
                  group={group}
                  isSelected={selectedId === group.id}
                  onClick={() => onSelectGroup(group)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm text-center">No groups yet</p>
                <p className="text-xs text-center mt-1">Create a group to start chatting</p>
              </div>
            )}
          </div>
        );
      case 'archive':
        return (
          <div className="space-y-1">
            {archivedGroups && archivedGroups.length > 0 ? (
              archivedGroups.map((group) => (
                <ConversationCard
                  key={group.id}
                  group={group}
                  isSelected={selectedId === group.id}
                  onClick={() => onSelectGroup(group)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p className="text-sm text-center">No archived contacts</p>
                <p className="text-xs text-center mt-1">Archived contacts will appear here</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const CurrentIcon = categoryIcons[activeCategory];
  const currentLabel = categoryLabels[activeCategory];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Category Title - Changes based on sidenav selection */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CurrentIcon size={22} className="text-[#1E90FF]" />
          <h2 className="text-lg font-semibold text-gray-900">
            {currentLabel}
          </h2>
        </div>
        
        {/* Create Group Button - Only shows for Groups */}
        {activeCategory === 'groups' && onCreateGroup && (
          <button
            onClick={onCreateGroup}
            className="p-2 rounded-full bg-[#1E90FF] text-white hover:bg-[#1c7bd6] transition-colors"
            title="Create new group"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={`Search ${currentLabel.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent focus:bg-white"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default GroupList;

