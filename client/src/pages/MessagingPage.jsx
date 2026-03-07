
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups, createGroup, joinGroup } from '../api/groups';
import GroupList from '../components/messaging/GroupList';
import ConversationBody from '../components/messaging/ConversationBody';

const MessagingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId: urlGroupId } = useParams();
  
  // Determine active category based on URL path
  const getInitialCategory = () => {
    const path = location.pathname;
    if (path.includes('/groups')) return 'groups';
    if (path.includes('/archive')) return 'archive';
    return 'chats';
  };
  
  const [activeCategory, setActiveCategory] = useState(getInitialCategory);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [archivedGroups, setArchivedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create group modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Update category when URL changes
  useEffect(() => {
    setActiveCategory(getInitialCategory());
  }, [location.pathname]);

  useEffect(() => {
    // If URL has groupId, find and select the corresponding group
    if (urlGroupId && groups.length > 0) {
      const group = groups.find(g => g.id === parseInt(urlGroupId));
      if (group) {
        setSelectedGroup(group);
      }
    }
  }, [urlGroupId, groups]);

  const loadData = async () => {
    try {
      const response = await getGroups();
      const groups = response.groups || [];
      
      // For now, all groups go to groups list
      // In a real app, you'd have separate endpoints or filters
      setGroups(groups);
      setArchivedGroups([]); // No archived groups for now
      
      // If URL has groupId, find and select
      if (urlGroupId) {
        const group = groups.find(g => g.id === parseInt(urlGroupId));
        if (group) {
          setSelectedGroup(group);
        }
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    // Navigate to the category
    switch (category) {
      case 'chats':
        navigate('/messages');
        break;
      case 'groups':
        navigate('/messages/groups');
        break;
      case 'archive':
        navigate('/messages/archive');
        break;
      default:
        break;
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    // Navigate to the group
    navigate(`/messages/${group.id}`);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const response = await createGroup(newGroupName);
      setGroups([response.group, ...groups]);
      setShowCreateModal(false);
      setNewGroupName('');
      
      // Auto-join the created group
      await joinGroup(response.group.id);
      navigate(`/messages/${response.group.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E90FF]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0">
      {/* Card 1 - Group List (30% width, min 280px, max 400px) */}
      <div className="w-[30%] min-w-[280px] max-w-[400px] h-full border-r border-gray-200">
        <GroupList
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          groups={groups}
          archivedGroups={archivedGroups}
          selectedId={selectedGroup?.id}
          onSelectGroup={handleGroupSelect}
          onCreateGroup={() => setShowCreateModal(true)}
        />
      </div>

      {/* Card 2 - Conversation Body (70% width) */}
      <div className="flex-1 h-full">
        <ConversationBody group={selectedGroup} />
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                  placeholder="Enter group name"
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroupName('');
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#1E90FF] hover:bg-[#1c7bd6] text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;

