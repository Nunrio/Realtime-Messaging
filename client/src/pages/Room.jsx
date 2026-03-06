import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getRoom } from '../api/rooms';
import Message from '../components/Message';
import TypingIndicator from '../components/TypingIndicator';
import OnlineUsers from '../components/OnlineUsers';
import CollaborativeNote from '../components/CollaborativeNote';

const REACTIONS = ['👍', '❤️', '😂', '🔥', '😮', '😢', '🎉', '👋'];

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, joinRoom, leaveRoom, sendMessage, sendTyping, addReaction, removeReaction, updateNote } = useSocket();
    
    const [room, setRoom] = useState(null);
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
    const messageInputRef = useRef(null);

    useEffect(() => {
        loadRoom();
    }, [roomId]);

    useEffect(() => {
        if (!socket) return;

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
        socket.on('user_joined', ({ user }) => {
            console.log(`${user.username} joined`);
        });

        // Listen for user left
        socket.on('user_left', ({ user }) => {
            console.log(`${user.username} left`);
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

        // Join room
        joinRoom(roomId);

        return () => {
            leaveRoom(roomId);
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
    }, [socket, roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadRoom = async () => {
        try {
            const response = await getRoom(roomId);
            setRoom(response.room);
        } catch (err) {
            console.error('Failed to load room:', err);
            navigate('/dashboard');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        sendMessage(roomId, newMessage.trim());
        setNewMessage('');
        
        // Stop typing indicator
        sendTyping(roomId, false);
        setSending(false);
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        sendTyping(roomId, true);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(roomId, false);
        }, 2000);
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
        updateNote(roomId, content);
    };

    if (!room) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Room Header */}
                <div className="bg-primary-600 text-white px-6 py-4">
                    <h2 className="text-xl font-bold">{room.room_name}</h2>
                    <p className="text-primary-200 text-sm">{onlineUsers.length} online</p>
                </div>

                {/* Tabs */}
                <div className="border-b">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-6 py-3 font-medium transition ${
                                activeTab === 'chat' 
                                    ? 'border-b-2 border-primary-600 text-primary-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-6 py-3 font-medium transition ${
                                activeTab === 'notes' 
                                    ? 'border-b-2 border-primary-600 text-primary-600' 
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
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
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
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        ref={messageInputRef}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
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
            <div className="w-64 border-l bg-gray-50">
                <OnlineUsers users={onlineUsers} currentUser={user} />
            </div>
        </div>
    );
};

export default Room;

