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
    onClose?: () => void;
    type?: 'info' | 'danger' | 'success';
    singleButton?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    onClose,
    type = 'info',
    singleButton = false,
    confirmText = '확인',
    cancelText = '취소'
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
            onClick={onClose || (singleButton ? onConfirm : onCancel)}
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
                                className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                {cancelText || '취소'}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2
                                ${type === 'danger'
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-red-500/25'
                                    : type === 'success'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-green-500/25'
                                        : 'bg-gradient-to-r from-[var(--btn-bg)] to-[var(--btn-bg-hover)] hover:shadow-[var(--btn-bg)]/25'
                                }`}
                        >
                            {confirmText || '확인'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
