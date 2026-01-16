import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
}

const InputModal: React.FC<InputModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    placeholder = '',
    defaultValue = '',
    confirmText = '확인',
    cancelText = '취소'
}) => {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        if (!value.trim()) return;
        onConfirm(value);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)]">
                    <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                        <X size={18} className="text-[var(--text-secondary)]" />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    {message && (
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{message}</p>
                    )}

                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full p-3 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-xl outline-none focus:border-[var(--btn-bg)] focus:ring-1 focus:ring-[var(--btn-bg)] transition-all text-[var(--text-primary)]"
                    />

                    <div className="flex gap-2 justify-end mt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!value.trim()}
                            className="px-4 py-2 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            <Check size={16} />
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
