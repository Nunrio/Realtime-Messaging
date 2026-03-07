import React, { useState, useEffect, useRef } from 'react';
import ReactionPicker from './ReactionPicker';

const Message = ({ message, currentUser, onReact, showReactions, setShowReactions }) => {
    const [showAllReactions, setShowAllReactions] = useState(false);
    const reactionPickerRef = useRef(null);
    const reactionButtonRef = useRef(null);
    const [pickerStyle, setPickerStyle] = useState({});

    const isOwn = message.user_id === currentUser?.id;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target)) {
                setShowReactions(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowReactions]);

    // Calculate picker position synchronously when showing
    const handleReactionButtonClick = (e) => {
        e.stopPropagation();
        
        if (showReactions === message.id) {
            setShowReactions(null);
            setPickerStyle({});
        } else {
            // Calculate position immediately before setting state
            if (reactionButtonRef.current) {
                const button = reactionButtonRef.current.getBoundingClientRect();
                const newStyle = {
                    position: 'fixed',
                    left: button.left + (button.width / 2),
                    top: button.top - 8,
                    transform: 'translate(-50%, -100%)',
                    zIndex: 9999
                };
                setPickerStyle(newStyle);
            }
            setShowReactions(message.id);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleReactionClick = (e, reactionType) => {
        e.stopPropagation();
        onReact(message.id, reactionType);
    };

    const displayReactions = showAllReactions ? message.reactions : (message.reactions || []).slice(0, 3);

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} relative`}>
                <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <div className={`px-4 py-2 rounded-lg ${
                        isOwn 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                        {!isOwn && (
                            <p className="text-xs font-semibold text-primary-600 mb-1">{message.username}</p>
                        )}
                        <p className="break-words">{message.message}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-200' : 'text-gray-500'}`}>
                            {formatTime(message.timestamp)}
                        </p>
                    </div>
                    
                    <button
                        ref={reactionButtonRef}
                        onClick={handleReactionButtonClick}
                        className="text-gray-400 hover:text-gray-600 p-1 self-center"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>

                {/* Reactions Display */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                        {displayReactions.map((reaction, idx) => (
                            <button
                                key={idx}
                                onClick={() => onReact(message.id, reaction.type)}
                                className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 transition ${
                                    reaction.users?.includes(currentUser?.id)
                                        ? 'bg-primary-100 border border-primary-300'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                <span>{reaction.type}</span>
                                <span className="text-gray-600">{reaction.count}</span>
                            </button>
                        ))}
                        {(message.reactions.length > 3) && !showAllReactions && (
                            <button
                                onClick={() => setShowAllReactions(true)}
                                className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                +{message.reactions.length - 3}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Reaction Picker - Fixed positioning to overflow beyond container */}
            {showReactions === message.id && (
                <div 
                    ref={reactionPickerRef}
                    style={pickerStyle}
                >
                    <ReactionPicker 
                        onSelect={(reaction) => handleReactionClick({ stopPropagation: () => {} }, reaction)}
                        onClose={() => {
                            setShowReactions(null);
                            setPickerStyle({});
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Message;

