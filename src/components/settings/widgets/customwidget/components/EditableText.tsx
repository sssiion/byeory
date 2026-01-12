import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
    text: string;
    tagName: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
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
            inputRef.current.select();
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

    // 🌟 편집 모드 스타일 수정 (여백 제거)
    if (isEditing) {
        return (
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                // p-0, m-0, leading-none 추가하여 여백 완전 제거
                className={`w-full bg-transparent outline-none resize-none overflow-hidden p-0 m-0 leading-none ${className}`}
                style={{ ...style, lineHeight: '1' }} // 줄간격 강제 1
                placeholder={placeholder}
            />
        );
    }

    // 🌟 뷰 모드 스타일 수정 (여백 제거)
    return (
        <Tag
            // 🔥 핵심 수정 사항 🔥
            // 1. m-0: 브라우저 기본 마진 제거 (h1, p 태그 등)
            // 2. p-0: 패딩 제거
            // 3. leading-none: 줄간격 여백 제거
            // 4. block: 인라인 요소로 인한 하단 틈 제거
            className={`cursor-text hover:bg-black/5 rounded transition-colors border border-transparent hover:border-black/10 w-full h-full m-0 p-0 leading-none block ${className}`}
            style={{ ...style }}
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
        >
            {text || <span className="text-gray-400 opacity-50 block">{placeholder || '텍스트 입력...'}</span>}
        </Tag>
    );
};