import React from 'react';

const REACTIONS = ['👍', '❤️', '🔥', '😂', '😮', '😢'];

const ReactionPicker = ({ onSelect, onClose }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg border p-2 flex gap-1 z-50">
            {REACTIONS.map((reaction) => (
                <button
                    key={reaction}
                    onClick={() => {
                        onSelect(reaction);
                        if (onClose) onClose();
                    }}
                    className="text-xl hover:bg-gray-100 p-1 rounded transition"
                >
                    {reaction}
                </button>
            ))}
        </div>
    );
};

export default ReactionPicker;

