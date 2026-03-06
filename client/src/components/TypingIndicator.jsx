import React from 'react';

const TypingIndicator = ({ users }) => {
    if (!users || users.length === 0) return null;

    const getTypingText = () => {
        if (users.length === 1) {
            return `${users[0].username} is typing...`;
        } else if (users.length === 2) {
            return `${users[0].username} and ${users[1].username} are typing...`;
        } else {
            return `${users[0].username} and ${users.length - 1} others are typing...`;
        }
    };

    return (
        <div className="px-4 py-2 text-gray-500 text-sm flex items-center gap-2">
            <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
            </div>
            <span>{getTypingText()}</span>
        </div>
    );
};

export default TypingIndicator;

