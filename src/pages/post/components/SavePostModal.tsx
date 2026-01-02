import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import SaveLocationWidget from './SaveLocationWidget';
import { motion, AnimatePresence } from 'framer-motion';
import type { PostData } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentTags: string[];
    onTagsChange: (tags: string[]) => void;
    customAlbums: any[];
    isSaving: boolean;
    // ✨ New Props
    selectedAlbumIds: string[];
    onAlbumIdsChange: (ids: string[]) => void;
    onCreateAlbum: (name: string, tags: string[]) => string | null;
    onDeleteAlbum: (id: string) => void; // ✨ New
    posts: PostData[]; // ✨ New
}

const SavePostModal: React.FC<Props> = ({
    isOpen, onClose, onConfirm,
    currentTags, onTagsChange, customAlbums, isSaving,
    selectedAlbumIds, onAlbumIdsChange, onCreateAlbum,
    onDeleteAlbum, posts
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)]">
                        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Save size={20} className="text-indigo-600" />
                            저장 위치 선택
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full text-[var(--text-secondary)] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto bg-[var(--bg-primary)]">
                        <SaveLocationWidget
                            currentTags={currentTags}
                            onTagsChange={onTagsChange}
                            customAlbums={customAlbums}
                            selectedAlbumIds={selectedAlbumIds}
                            onAlbumIdsChange={onAlbumIdsChange}
                            onCreateAlbum={onCreateAlbum}
                            onDeleteAlbum={onDeleteAlbum}
                            posts={posts}
                        />

                        {/* Unclassified Warning */}
                        {currentTags.length === 0 && selectedAlbumIds.length === 0 && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <span className="font-bold">주의:</span> 저장 위치(태그 또는 앨범)가 선택되지 않았습니다.<br />
                                    이 경우 <span className="font-bold">모든 기록 보관함 (미분류)</span>에 저장됩니다.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] rounded-xl transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSaving}
                            className="px-6 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <><span>저장 중...</span></>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>저장 완료</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SavePostModal;
