import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
    text: string;
    tagName: 'h1' | 'h2' | 'h3' | 'p' | 'div';
    className?: string;
    style?: React.CSSProperties;
    onUpdate: (newText: string) => void;
    placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
    text,
    tagName: Tag,
    className,
    style,
    onUpdate,
    placeholder
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(text);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setValue(text);
    }, [text]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select(); // ✨ Auto-select text
            // Auto-resize
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (value !== text) {
            onUpdate(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    if (isEditing) {
        return (
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`w-full bg-transparent outline-none resize-none overflow-hidden ${className}`}
                style={{ ...style, minHeight: '1.2em' }}
                placeholder={placeholder}
            />
        );
    }

    return (
        <Tag
            className={`${className} cursor-text hover:bg-black/5 rounded px-1 transition-colors -mx-1 border border-transparent hover:border-black/10`}
            style={{ ...style, minHeight: '1em' }}
            onClick={(e) => {
                e.stopPropagation(); // Prevent drag start if possible
                setIsEditing(true);
            }}
        >
            {text || <span className="text-gray-400 opacity-50">{placeholder || '텍스트 입력...'}</span>}
        </Tag>
    );
};
