import React, { useState } from 'react';
import { Check, Hash, FolderOpen, Sparkles, Trash2, X, Book, Folder } from 'lucide-react';
import type { PostData } from '../types'; // Keep if reused or remove if totally unused. Lint says unused.
// Actually, let's remove it if unused.

interface CustomAlbum {
    id: string;
    name: string;
    tag: string | null;
    parentId?: string | null;
    postCount?: number;
    folderCount?: number;
}

interface Props {
    currentTags: string[]; // Keep for legacy/visual, but main logic is IDs
    selectedAlbumIds: string[];
    onTagsChange: (tags: string[]) => void;
    onAlbumIdsChange: (ids: string[]) => void;
    customAlbums: CustomAlbum[];
    onCreateAlbum: (name: string, tags: string[]) => Promise<string | null>;
    onDeleteAlbum: (id: string) => void;
    mode: 'AUTO' | 'MANUAL'; // ✨ New Prop
}

const SaveLocationWidget: React.FC<Props> = ({ currentTags, selectedAlbumIds = [], onTagsChange, onAlbumIdsChange, customAlbums, onCreateAlbum, onDeleteAlbum, mode }) => {
    // State for Tag Input
    const [tagInput, setTagInput] = useState("");
    // State for Album Search
    const [albumSearch, setAlbumSearch] = useState("");

    // --- Tag Logic ---
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/^#/, '');
            if (!newTag) return;

            if (!currentTags.includes(newTag)) {
                onTagsChange([...currentTags, newTag]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onTagsChange(currentTags.filter(tag => tag !== tagToRemove));
    };

    // --- Helper for Hierarchy ---
    const getAlbumPath = (albumId: string): string => {
        const album = customAlbums.find(a => a.id === albumId);
        if (!album) return '';
        if (album.parentId) {
            const parent = customAlbums.find(a => a.id === album.parentId);
            if (parent) return `${parent.name} > ${album.name}`;
        }
        return album.name;
    };

    // --- Album Logic ---
    let filteredAlbums = customAlbums;
    let missingTagsForCreation: string[] = [];

    if (albumSearch.trim()) {
        const lowerSearch = albumSearch.toLowerCase();
        // 1. Find directly matching albums
        const directMatches = customAlbums.filter(album =>
            album.name.toLowerCase().includes(lowerSearch) ||
            (album.tag && album.tag.toLowerCase().includes(lowerSearch))
        );

        // 2. Find children of matching albums
        const childMatches = customAlbums.filter(album =>
            album.parentId && directMatches.some(parent => parent.id === album.parentId)
        );

        // 3. Combine and deduplicate
        const combined = [...directMatches, ...childMatches];
        filteredAlbums = Array.from(new Set(combined.map(a => a.id)))
            .map(id => combined.find(a => a.id === id)!);

    } else if (currentTags.length > 0 && mode === 'AUTO') { // ✨ Only filter by tags in AUTO mode
        // ... (existing tag logic) ...
        // Find albums that match any of the current tags
        const tagMatches = customAlbums.filter(album =>
            currentTags.some(tag => album.name === tag || album.tag === tag)
        );
        // Also include children of tag-matched albums (optional but consistent)
        const childMatches = customAlbums.filter(album =>
            album.parentId && tagMatches.some(parent => parent.id === album.parentId)
        );

        const combined = [...tagMatches, ...childMatches];
        filteredAlbums = Array.from(new Set(combined.map(a => a.id)))
            .map(id => combined.find(a => a.id === id)!);


        // Identify tags that don't have a corresponding album
        missingTagsForCreation = currentTags.filter(tag =>
            !customAlbums.some(album => album.name === tag || album.tag === tag)
        );
    } else {
        filteredAlbums = customAlbums;
    }

    const toggleAlbum = (id: string) => {
        if (selectedAlbumIds.includes(id)) {
            onAlbumIdsChange(selectedAlbumIds.filter(i => i !== id));
        } else {
            onAlbumIdsChange([...selectedAlbumIds, id]);
        }
    };

    const handleCreateAlbum = async (tagName: string) => {
        const input = tagName.trim();
        if (!input) return;
        const newTag = input.replace(/^#/, ''); // Default tag from name

        const newId = await onCreateAlbum(newTag, [newTag]);
        if (newId) {
            onAlbumIdsChange([...selectedAlbumIds, newId]);
            // If created from search, clear search
            if (albumSearch) setAlbumSearch("");
        }
    };

    // --- Select/Deselect All Logic ---
    const handleToggleAll = () => {
        if (selectedAlbumIds.length > 0) {
            // Deselect All
            onAlbumIdsChange([]);
        } else {
            // Select All (Visible items only? or All items? usually visual/search context)
            // User request: "If nothing clicked -> Select All". 
            // Context implies selecting the result of the search usually.
            const visibleIds = filteredAlbums.map(a => a.id);
            onAlbumIdsChange(visibleIds);
        }
    };

    // --- Auto-Select Logic ---
    React.useEffect(() => {
        if (mode === 'AUTO' && currentTags.length > 0 && !albumSearch.trim()) {
            // Only auto-select if we are in the "Tag Mode" (no manual search)
            const autoSelectIds = filteredAlbums.map(a => a.id);

            const combined = Array.from(new Set([...selectedAlbumIds, ...autoSelectIds]));
            if (combined.length !== selectedAlbumIds.length) {
                onAlbumIdsChange(combined);
            }
        } else if (mode === 'AUTO' && currentTags.length === 0) {
            // In Auto mode, if no tags, maybe clear selection if it was auto-selected?
            // But let's not be too aggressive clearing user selection if they mixed modes.
        }
    }, [currentTags, customAlbums.length, albumSearch, mode]);
    // Added albumSearch dependency so it only runs when search is empty (implied by logic above)

    // Calculate Hidden Selected Items
    const visibleIds = new Set(filteredAlbums.map(a => a.id));
    const hiddenSelectedIds = selectedAlbumIds.filter(id => !visibleIds.has(id));

    return (
        <div className="space-y-6">
            {/* 1. Tag Settings Section */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${mode === 'MANUAL' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Hash size={18} className="text-indigo-500" />
                    태그 설정 {mode === 'MANUAL' && <span className="text-xs font-normal text-gray-500">(자동 분류 모드 전용)</span>}
                </h3>

                <div className="relative mb-3">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="해시태그 입력 (Enter로 추가)"
                        disabled={mode === 'MANUAL'}
                        className="w-full pl-3 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-gray-100"
                    />
                </div>

                {/* Tag Chips (Pebbles) */}
                <div className="flex flex-wrap gap-2">
                    {currentTags.map(tag => (
                        <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full shadow-sm hover:bg-indigo-100 transition-colors">
                            <span>#{tag}</span>
                            <button
                                onClick={() => removeTag(tag)}
                                disabled={mode === 'MANUAL'}
                                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-200 text-indigo-500 disabled:pointer-events-none"
                            >
                                <X size={10} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                    {currentTags.length === 0 && (
                        <span className="text-xs text-gray-400 py-1">추가된 태그가 없습니다.</span>
                    )}
                </div>
            </div>

            {/* 2. Save Location Section */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${mode === 'AUTO' ? 'opacity-70 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FolderOpen size={18} className="text-indigo-500" />
                        저장 위치 선택 {mode === 'AUTO' && <span className="text-xs font-normal text-gray-500">(자동 선택됨)</span>}
                    </h3>

                    <button
                        onClick={handleToggleAll}
                        disabled={mode === 'AUTO'}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors disabled:pointer-events-none"
                    >
                        {selectedAlbumIds.length > 0 ? '전부 해제' : '전부 선택'}
                    </button>
                </div>

                {/* Album Search */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={albumSearch}
                        onChange={(e) => setAlbumSearch(e.target.value)}
                        placeholder="앨범 검색 또는 새 앨범 추가..."
                        disabled={mode === 'AUTO'}
                        className="w-full pl-3 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-gray-100"
                    />
                </div>

                {/* Hidden Selected Items Summary */}
                {hiddenSelectedIds.length > 0 && (
                    <div className="mb-3 space-y-2">
                        {hiddenSelectedIds.map(id => {
                            const album = customAlbums.find(a => a.id === id);
                            if (!album) return null;
                            const pathName = getAlbumPath(id);

                            // Use server-provided counts
                            const recordCount = album.postCount ?? 0;
                            const folderCount = album.folderCount ?? 0;

                            return (
                                <div
                                    key={id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/50"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600">
                                            {album.parentId ? <Folder size={16} /> : <Book size={16} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-indigo-900">
                                                {pathName}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <span>#{album.tag || '태그없음'}</span>
                                                {/* ✨ Only show folder count for top-level albums */}
                                                {!album.parentId && (
                                                    <>
                                                        <span>·</span>
                                                        <span>폴더 {folderCount}</span>
                                                    </>
                                                )}
                                                <span>·</span><span>기록 {recordCount}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full border border-indigo-500 bg-indigo-500 flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                        <button
                                            onClick={() => toggleAlbum(id)} // Allowed to uncheck even in AUTO? Maybe not.
                                            disabled={mode === 'AUTO'}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {/* 1. Filtered or Tag-Matched Albums */}
                    {filteredAlbums.map((album) => {
                        const isSelected = selectedAlbumIds.includes(album.id);
                        const pathName = getAlbumPath(album.id);

                        // Stats Logic - Use server provided counts
                        const recordCount = album.postCount ?? 0;
                        const folderCount = album.folderCount ?? 0;

                        return (
                            <div
                                key={album.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all mb-2 ${isSelected
                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                                    : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div
                                    className={`flex items-center gap-3 flex-1 ${mode === 'AUTO' ? '' : 'cursor-pointer'}`}
                                    onClick={() => mode !== 'AUTO' && toggleAlbum(album.id)}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {album.parentId ? <Folder size={16} /> : <Book size={16} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {pathName}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <span>#{album.tag || '태그없음'}</span>
                                            {/* ✨ Only show folder count for top-level albums */}
                                            {!album.parentId && (
                                                <>
                                                    <span>·</span>
                                                    <span>폴더 {folderCount}</span>
                                                </>
                                            )}
                                            <span>·</span><span>기록 {recordCount}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        onClick={() => mode !== 'AUTO' && toggleAlbum(album.id)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${mode !== 'AUTO' ? 'cursor-pointer' : ''} ${isSelected
                                            ? 'bg-indigo-500 border-indigo-500'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`'${album.name}' 앨범을 삭제하시겠습니까?`)) {
                                                onDeleteAlbum(album.id);
                                            }
                                        }}
                                        disabled={mode === 'AUTO'}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* 2. Creation Options for Missing Tags */}
                    {missingTagsForCreation.map(tag => (
                        <div
                            key={`create-${tag}`}
                            onClick={() => handleCreateAlbum(tag)}
                            className={`flex items-center gap-3 p-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 cursor-pointer hover:bg-indigo-50 transition-colors mb-2 group ${mode === 'AUTO' ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                                <Sparkles size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                                    '{tag}' 앨범 만들기
                                    <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">NEW</span>
                                </span>
                                <span className="text-xs text-indigo-600/70">
                                    태그와 동일한 이름의 앨범을 생성합니다.
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* 3. Search Creation Option */}
                    {albumSearch && !filteredAlbums.some(a => a.name === albumSearch) && (
                        <div
                            onClick={() => handleCreateAlbum(albumSearch)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 cursor-pointer hover:bg-indigo-50 transition-colors mb-2 group"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                                <Sparkles size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                                    '{albumSearch}' 앨범 만들기
                                    {/* NEW Badge */}
                                    <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">NEW</span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredAlbums.length === 0 && missingTagsForCreation.length === 0 && !albumSearch && (
                        <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            생성된 앨범이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveLocationWidget;
