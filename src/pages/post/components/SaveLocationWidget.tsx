import React, { useState } from 'react';
import { Check, Hash, FolderOpen, Sparkles, Trash2 } from 'lucide-react';
import type { PostData } from '../types';

interface CustomAlbum {
    id: string;
    name: string;
    tag: string | null;
    parentId?: string | null;
}

interface Props {
    currentTags: string[]; // Keep for legacy/visual, but main logic is IDs
    selectedAlbumIds: string[];
    onTagsChange: (tags: string[]) => void;
    onAlbumIdsChange: (ids: string[]) => void;
    customAlbums: CustomAlbum[];
    onCreateAlbum: (name: string, tags: string[]) => string | null;
    onDeleteAlbum: (id: string) => void; // ✨ New
    posts: PostData[]; // ✨ New for stats
}

const SaveLocationWidget: React.FC<Props> = ({ currentTags, selectedAlbumIds = [], onTagsChange, onAlbumIdsChange, customAlbums, onCreateAlbum, onDeleteAlbum, posts }) => {
    const [inputValue, setInputValue] = useState("");

    // ✨ Filter albums based on search input
    const filteredAlbums = customAlbums.filter(album =>
        album.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        (album.tag && album.tag.toLowerCase().includes(inputValue.toLowerCase()))
    );

    const handleCreateNew = () => {
        const input = inputValue.trim();
        const newTag = input.startsWith('#') ? input.substring(1) : input;

        if (!newTag) return;

        // Create new album immediately
        // Name = Tag (simple default)
        const newId = onCreateAlbum(newTag, [newTag]);

        if (newId) {
            // Select the new album
            onAlbumIdsChange([...selectedAlbumIds, newId]);
            // Also add tag for consistency
            if (!currentTags.includes(newTag)) {
                onTagsChange([...currentTags, newTag]);
            }
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();

            // Check if there is an exact match for name, if so, maybe just select it?
            // But let's stick to "Create" logic if it's new.
            // If user presses Enter, and there are filtered albums, maybe select the first one?
            // Or if New Tag is shown, select that?

            const input = inputValue.trim();
            const normalizedInput = input.startsWith('#') ? input.substring(1) : input;

            // If exact match exists in filtered albums, select it
            const exactMatch = customAlbums.find(a => a.name === normalizedInput || a.tag === normalizedInput);
            if (exactMatch) {
                toggleAlbum(exactMatch.id);
                setInputValue("");
            } else {
                // Create new
                handleCreateNew();
            }
        }
    };

    const toggleAlbum = (id: string) => {
        if (selectedAlbumIds.includes(id)) {
            onAlbumIdsChange(selectedAlbumIds.filter(i => i !== id));
        } else {
            onAlbumIdsChange([...selectedAlbumIds, id]);
        }
    };

    // Check if input is a new tag (not matching any existing album's tag OR Name exactly)
    const normalizedInput = inputValue.trim().startsWith('#') ? inputValue.trim().substring(1) : inputValue.trim();
    const isNewTag = normalizedInput && !customAlbums.some(a => a.name === normalizedInput || a.tag === normalizedInput);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FolderOpen size={18} className="text-indigo-500" />
                저장 위치
            </h3>

            {/* ✨ Search / Input Area */}
            <div className="relative mb-4">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="앨범 검색 또는 새 앨범 추가..."
                    className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>

            <p className="text-xs text-gray-500 mb-2">
                저장할 앨범을 선택하세요. (다중 선택 가능)
            </p>

            {/* ✨ Unified List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">

                {/* 1. New Tag Option (if typing new tag) */}
                {isNewTag && (
                    <div
                        onClick={handleCreateNew}
                        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 cursor-pointer hover:bg-indigo-50 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600">
                            <Sparkles size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-indigo-900">
                                '{normalizedInput}' 앨범 만들기
                            </span>
                            <span className="text-xs text-indigo-600/70">
                                새 앨범을 생성하고 선택합니다.
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. Existing Albums List */}
                {filteredAlbums.length === 0 && !isNewTag ? (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        {inputValue ? "검색 결과가 없습니다." : "생성된 앨범이 없습니다."}
                    </div>
                ) : (
                    filteredAlbums.map((album) => {
                        const isSelected = selectedAlbumIds.includes(album.id);

                        // ✨ Calculate Stats
                        // Count posts in this album (ID match or Tag match)
                        const recordCount = posts.filter(p => {
                            if (p.albumIds && p.albumIds.includes(album.id)) return true;
                            if ((!p.albumIds || p.albumIds.length === 0) && p.tags && album.tag && p.tags.includes(album.tag)) return true;
                            return false;
                        }).length;

                        // Count direct sub-folders
                        const folderCount = customAlbums.filter(a => a.parentId === album.id).length;

                        return (
                            <div
                                key={album.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                    ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/20'
                                    : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => toggleAlbum(album.id)}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <FolderOpen size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {album.name}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <span>#{album.tag || '태그없음'}</span>
                                            <span>·</span>
                                            <span>폴더 {folderCount}</span>
                                            <span>·</span>
                                            <span>기록 {recordCount}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        onClick={() => toggleAlbum(album.id)}
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${isSelected
                                            ? 'bg-indigo-500 border-indigo-500'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        {isSelected && <Check size={12} className="text-white" />}
                                    </div>

                                    {/* ✨ Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`'${album.name}' 앨범을 삭제하시겠습니까?\n\n⚠️ 주의: 앨범에 포함된 모든 하위 폴더와 기록이 영구적으로 삭제됩니다.`)) {
                                                onDeleteAlbum(album.id);
                                            }
                                        }}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="앨범 삭제"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SaveLocationWidget;
