import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newName: string) => void;
    currentName: string;
    showConfirmModal?: (title: string, message: string, type?: 'info' | 'danger' | 'success', onConfirm?: () => void, singleButton?: boolean) => void;
}

const RenameAlbumModal: React.FC<Props> = ({ isOpen, onClose, onSave, currentName, showConfirmModal }) => {
    const [name, setName] = useState(currentName);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
        }
    }, [isOpen, currentName]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) {
            if (showConfirmModal) {
                showConfirmModal("입력 확인", "앨범 이름을 입력해주세요.", "danger", undefined, true);
            } else {
                alert("앨범 이름을 입력해주세요.");
            }
            return;
        }
        onSave(name);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">앨범 이름 변경</h3>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            새로운 이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            placeholder="앨범 이름 입력"
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--border-color)] transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                        >
                            변경
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RenameAlbumModal;
