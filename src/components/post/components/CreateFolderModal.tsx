import React, { useState } from 'react';
import { X, Folder } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => Promise<string | null | void> | string | null | void;
    showConfirmModal?: (title: string, message: string, type?: 'info' | 'danger' | 'success', onConfirm?: () => void, singleButton?: boolean) => void;
}

const CreateFolderModal: React.FC<Props> = ({ isOpen, onClose, onCreate, showConfirmModal }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!name.trim()) {
            if (showConfirmModal) {
                showConfirmModal("입력 확인", "폴더 이름을 입력해주세요.", "danger", undefined, true);
            } else {
                alert("폴더 이름을 입력해주세요.");
            }
            return;
        }
        const result = await onCreate(name);

        // ✨ Only close if creation succeeded (result is not null/false)
        if (result) {
            setName('');
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleCreate();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[var(--bg-modal)] rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all animate-scale-up border border-[var(--border-color)] backdrop-blur-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Folder className="text-indigo-500" size={24} />
                        폴더 만들기
                    </h3>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            폴더 이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            placeholder="예: 여행, 맛집, 일상"
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
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
                            onClick={handleCreate}
                            className="flex-1 py-3 px-4 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-bold hover:opacity-90 shadow-lg shadow-indigo-500/20 transition"
                        >
                            만들기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;
