
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getGroup } from '../../api/groups';
import Message from '../Message';
import TypingIndicator from '../TypingIndicator';
import OnlineUsers from '../OnlineUsers';
import CollaborativeNote from '../CollaborativeNote';
import ReactionPicker from '../ReactionPicker';

const REACTIONS = ['👍', '❤️', '😂', '🔥', '😮', '😢', '🎉', '👋'];

const ConversationBody = ({ group }) => {
  const { groupId: paramGroupId } = useParams();
  const groupId = paramGroupId || group?.id;
  
  const { user } = useAuth();
  const { socket, joinGroup, leaveGroup, sendMessage, sendTyping, addReaction, removeReaction, updateNote } = useSocket();
  
  const [currentGroup, setCurrentGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showReactions, setShowReactions] = useState(null);
  const [note, setNote] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  useEffect(() => {
    if (!socket || !groupId) return;

    // Listen for message history
    socket.on('message_history', (history) => {
      setMessages(history);
      setLoading(false);
    });

    // Listen for new messages
    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Listen for user joined
    socket.on('user_joined', ({ user: joinedUser }) => {
      console.log(`${joinedUser.username} joined`);
    });

    // Listen for user left
    socket.on('user_left', ({ user: leftUser }) => {
      console.log(`${leftUser.username} left`);
    });

    // Listen for online users
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Listen for typing indicator
    socket.on('typing_indicator', ({ user: typingUser, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.find(u => u.id === typingUser.id)) {
            return [...prev, typingUser];
          }
        } else {
          return prev.filter(u => u.id !== typingUser.id);
        }
        return prev;
      });
    });

    // Listen for reaction updates
    socket.on('reaction_update', ({ messageId, reactions }) => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, reactions } : msg
        )
      );
    });

    // Listen for note updates
    socket.on('note_updated', (updatedNote) => {
      setNote(updatedNote);
    });

    // Listen for note content
    socket.on('note_content', (noteContent) => {
      setNote(noteContent);
    });

    // Join group
    joinGroup(groupId);

    return () => {
      leaveGroup(groupId);
      socket.off('message_history');
      socket.off('new_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('online_users');
      socket.off('typing_indicator');
      socket.off('reaction_update');
      socket.off('note_updated');
      socket.off('note_content');
    };
  }, [socket, groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadGroup = async () => {
    if (!groupId) return;
    try {
      const response = await getGroup(groupId);
      setCurrentGroup(response.group);
    } catch (err) {
      console.error('Failed to load group:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !groupId) return;

    setSending(true);
    sendMessage(groupId, newMessage.trim());
    setNewMessage('');
    
    // Stop typing indicator
    sendTyping(groupId, false);
    setSending(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (groupId) {
      sendTyping(groupId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(groupId, false);
      }, 2000);
    }
  };

  const handleReaction = (messageId, reactionType) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const userReaction = message.reactions?.find(
      r => r.type === reactionType && r.users?.includes(user.id)
    );

    if (userReaction) {
      removeReaction(messageId, reactionType);
    } else {
      addReaction(messageId, reactionType);
    }
    setShowReactions(null);
  };

  const handleNoteChange = (content) => {
    if (groupId) {
      updateNote(groupId, content);
    }
  };

  // Get display name for the group
  const getDisplayName = (groupObj) => {
    return groupObj?.group_name || groupObj?.room_name || 'Loading...';
  };

  // If no group is selected, show empty state
  if (!group && !groupId) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Select contacts
          </h2>
          <p className="text-gray-500 max-w-xs">
            Choose contacts from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const displayGroup = currentGroup || group;

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Group Header */}
        <div className="bg-[#1E90FF] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{getDisplayName(displayGroup)}</h2>
            <p className="text-blue-200 text-sm">{onlineUsers.length} online</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'chat' 
                  ? 'border-b-2 border-[#1E90FF] text-[#1E90FF]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'notes' 
                  ? 'border-b-2 border-[#1E90FF] text-[#1E90FF]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <div className="h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1E90FF]"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      currentUser={user}
                      onReact={handleReaction}
                      showReactions={showReactions}
                      setShowReactions={setShowReactions}
                      reactions={REACTIONS}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              <TypingIndicator users={typingUsers} />

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-[#1E90FF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <CollaborativeNote
              note={note}
              onChange={handleNoteChange}
            />
          )}
        </div>
      </div>

      {/* Sidebar - Online Users */}
      <div className="w-64 border-l bg-gray-50 flex-shrink-0">
        <OnlineUsers users={onlineUsers} currentUser={user} />
      </div>
    </div>
  );
};

export default ConversationBody;

