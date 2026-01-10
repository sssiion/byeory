import { X, Save, AlertCircle } from 'lucide-react';
import SaveLocationWidget from './SaveLocationWidget';
import { motion, AnimatePresence } from 'framer-motion';

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
    onCreateAlbum: (name: string, tags: string[]) => Promise<string | null>;
    onDeleteAlbum: (id: string) => void;
    mode: 'AUTO' | 'MANUAL';
    setMode: (mode: 'AUTO' | 'MANUAL') => void;
    isFavorite: boolean;
    setIsFavorite: (val: boolean) => void;
    isPublic: boolean;
    setIsPublic: (val: boolean) => void;
}

const SavePostModal: React.FC<Props> = ({
    isOpen, onClose, onConfirm,
    currentTags, onTagsChange, customAlbums, isSaving,
    selectedAlbumIds, onAlbumIdsChange, onCreateAlbum,
    onDeleteAlbum,
    mode, setMode, isFavorite, setIsFavorite,
    isPublic, setIsPublic
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
                            저장 설정
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full text-[var(--text-secondary)] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto bg-[var(--bg-primary)] space-y-6">

                        {/* 1. Mode Switch & Favorite */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800">분류 모드</span>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setMode('AUTO')}
                                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${mode === 'AUTO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        자동 (AUTO)
                                    </button>
                                    <button
                                        onClick={() => setMode('MANUAL')}
                                        className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${mode === 'MANUAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        수동 (MANUAL)
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-yellow-500">★</span> 즐겨찾기
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <span className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-indigo-500">🌐</span> 커뮤니티 공개
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                </label>
                            </div>

                        </div>

                        <SaveLocationWidget
                            currentTags={currentTags}
                            onTagsChange={onTagsChange}
                            customAlbums={customAlbums}
                            selectedAlbumIds={selectedAlbumIds}
                            onAlbumIdsChange={onAlbumIdsChange}
                            onCreateAlbum={onCreateAlbum}
                            onDeleteAlbum={onDeleteAlbum}
                            mode={mode} // ✨ Pass mode
                        />

                        {/* Unclassified Warning */}
                        {mode === 'MANUAL' && selectedAlbumIds.length === 0 && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <span className="font-bold">주의:</span> 선택된 앨범이 없습니다.
                                </div>
                            </div>
                        )}
                        {mode === 'AUTO' && currentTags.length === 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <span className="font-bold">Info:</span> 태그를 입력하면 자동으로 앨범에 분류됩니다.
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
            </div >
        </AnimatePresence >
    );
};

export default SavePostModal;
