import React, { useState, useEffect, useRef } from 'react';

const CollaborativeNote = ({ note, onChange }) => {
    const [content, setContent] = useState(note?.content || '');
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        if (note?.content !== undefined) {
            setContent(note.content);
        }
    }, [note?.content]);

    const handleChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        
        // Debounce save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        setSaving(true);
        saveTimeoutRef.current = setTimeout(() => {
            onChange(newContent);
            setSaving(false);
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newContent = content.substring(0, start) + '    ' + content.substring(end);
            setContent(newContent);
            
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    return (
        <div className="h-full p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Collaborative Notes</h3>
                <span className="text-sm text-gray-500">
                    {saving ? 'Saving...' : 'Saved'}
                </span>
            </div>
            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Start typing your notes here..."
                className="w-full h-[calc(100%-40px)] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
            />
        </div>
    );
};

export default CollaborativeNote;

