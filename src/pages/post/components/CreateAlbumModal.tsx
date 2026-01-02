import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import AlbumBook from './AlbumCover/AlbumBook';
import CoverCustomizer from './AlbumCover/CoverCustomizer';
import type { AlbumCoverConfig } from './AlbumCover/constants';
import { COVER_COLORS } from './AlbumCover/constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, tags: string[], coverConfig?: AlbumCoverConfig) => void;
}

const CreateAlbumModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Cover Config State
    const [coverConfig, setCoverConfig] = useState<AlbumCoverConfig>({
        type: 'solid',
        value: COVER_COLORS[0].value,
        spineColor: COVER_COLORS[0].spine,
        labelColor: COVER_COLORS[0].text
    });
    const [isEditingCover, setIsEditingCover] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return alert("앨범 이름을 입력해주세요.");
        onSave(name, selectedTag ? [selectedTag] : [], coverConfig);
        setName('');
        setSelectedTag(null);
        // Reset cover to default
        setCoverConfig({
            type: 'solid',
            value: COVER_COLORS[0].value,
            spineColor: COVER_COLORS[0].spine,
            labelColor: COVER_COLORS[0].text
        });
    };

    const handleClose = () => {
        // Reset state
        setName('');
        setSelectedTag(null);
        setCoverConfig({
            type: 'solid',
            value: COVER_COLORS[0].value,
            spineColor: COVER_COLORS[0].spine,
            labelColor: COVER_COLORS[0].text
        });
        setIsEditingCover(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--bg-modal)] rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar backdrop-blur-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">새 앨범 만들기</h3>
                    <button onClick={handleClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {/* 1. 앨범 이름 */}
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            앨범 이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 맛집 탐방, 여행 기록"
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                    </div>

                    {/* 2. 표지 설정 */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-[var(--text-secondary)]">
                                표지 설정
                            </label>
                            <button
                                onClick={() => setIsEditingCover(true)}
                                className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                                <Sparkles size={12} />
                                꾸미기
                            </button>
                        </div>

                        <div className="flex justify-center bg-[var(--bg-card-secondary)] rounded-xl p-6 border border-[var(--border-color)]">
                            <AlbumBook
                                title={name || "새 앨범"}
                                tag={selectedTag || undefined} // Pass the selected tag
                                config={coverConfig}
                                className="w-32 shadow-md"
                            />
                        </div>
                    </div>

                    {/* 3. 해시태그 */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-[var(--text-secondary)]">
                                해시태그
                            </label>
                        </div>

                        <div className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition bg-[var(--bg-card-secondary)] flex items-center gap-2">
                            <span className="text-indigo-500 font-bold ml-1">#</span>
                            <input
                                type="text"
                                value={selectedTag || ''}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                placeholder="태그 입력"
                                className="flex-1 outline-none bg-transparent font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 px-4 bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] rounded-xl font-bold hover:bg-[var(--border-color)] transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-bold hover:opacity-90 shadow-lg shadow-indigo-500/20 transition"
                        >
                            {selectedTag ? '앨범 만들기' : '폴더 만들기'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Editing Logic - Opens the light-themed customizer */}
            {isEditingCover && (
                <CoverCustomizer
                    albumTitle={name || "새 앨범"}
                    albumTag={selectedTag || undefined} // ✨ Pass tag
                    initialConfig={coverConfig}
                    onSave={(newConfig) => {
                        setCoverConfig(newConfig);
                        setIsEditingCover(false);
                    }}
                    onClose={() => setIsEditingCover(false)}
                />
            )}
        </div>
    );
};

export default CreateAlbumModal;
