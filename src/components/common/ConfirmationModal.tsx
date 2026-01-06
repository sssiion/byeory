import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'info' | 'danger' | 'success';
    singleButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
    type = 'info',
    singleButton = false
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}
            onClick={singleButton ? onConfirm : onCancel}
        >
            <div
                className={`bg-[var(--bg-card)] w-[90vw] max-w-sm rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                        <AlertCircle size={24} />
                    </div>

                    <h3 className="text-lg font-black text-[var(--text-primary)] mb-2 whitespace-pre-wrap">
                        {title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6 whitespace-pre-wrap leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        {!singleButton && (
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--btn-bg)] hover:brightness-110'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
