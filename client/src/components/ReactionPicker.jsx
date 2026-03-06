import React from 'react';

const REACTIONS = ['👍', '❤️', '😂', '🔥', '😮', '😢', '🎉', '👋'];

const ReactionPicker = ({ onSelect, onClose }) => {
    return (
        <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border p-2 flex gap-1 z-20">
            {REACTIONS.map((reaction) => (
                <button
                    key={reaction}
                    onClick={() => {
                        onSelect(reaction);
                        onClose();
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

