import React, { useMemo, useState, useEffect } from 'react';
import type { PostData, CustomAlbum } from '../types';
// ✨ Added GalleryHorizontal for All Posts icon
import { Folder, Plus, PenLine, MoreVertical, Trash2, Edit, Sparkles, Lock, Users } from 'lucide-react';
import RenameAlbumModal from '../components/RenameAlbumModal';
import AlbumBook from '../components/AlbumCover/AlbumBook';
import type { AlbumCoverConfig } from '../components/AlbumCover/constants';
import CoverCustomizer from '../components/AlbumCover/CoverCustomizer';
import RoomSettingsModal from '../components/RoomSettingsModal';


interface Props {
    posts: PostData[];
    customAlbums: CustomAlbum[];
    onAlbumClick: (id: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
    onUpdateAlbum: (id: string, updates: Partial<CustomAlbum>) => void;
    onDeleteAlbum: (id: string) => void;
    sortOption: 'name' | 'count' | 'newest' | 'favorites';
    setSortOption: (option: 'name' | 'count' | 'newest' | 'favorites') => void;
    onPostClick: (post: PostData) => void;
    onToggleFavorite: (id: number) => void;
    handleToggleAlbumFavorite: (id: string) => void;
}

const PostAlbumPage: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting, onUpdateAlbum, onDeleteAlbum, sortOption, setSortOption, handleToggleAlbumFavorite }) => {
    // Key now refers to Album ID
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [roomSettingsId, setRoomSettingsId] = useState<string | null>(null);
    const [editingCoverId, setEditingCoverId] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                if (payload.email) setCurrentUserEmail(payload.email);
                else if (payload.sub && payload.sub.includes('@')) setCurrentUserEmail(payload.sub);
            } catch (e) { /* ignore */ }
        }
    }, []);

    const handleSaveCover = (config: AlbumCoverConfig) => {
        if (!editingCoverId) return;

        // Special albums (__all__, __others__) cannot save to backend in this simplified model 
        // unless we have a specific API for them or User Preference API. 
        // For now, ignoring Save for __all__ / __others__ as per 'Backend Only' instruction strictness (no LS).
        // OR: If they are virtual, we can't save them. User asked to remove LS. So they won't persist.
        if (editingCoverId === '__all__' || editingCoverId === '__others__') {
            alert("기본 보관함 커버는 현재 저장되지 않습니다.");
            return;
        }

        const album = customAlbums.find(a => a.id === editingCoverId);
        if (album) {
            onUpdateAlbum(album.id, { coverConfig: config });
        }
        setEditingCoverId(null);
    };

    // ✨ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdownId(null);
        };

        if (activeDropdownId) {
            window.addEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [activeDropdownId]);

    // ✨ Compute Album Stats
    const albumStats = useMemo(() => {
        const stats: Record<string, { count: number, folderCount: number, totalCount: number, lastDate: number }> = {};

        // Initialize stats from API data (No recursive calculation)
        customAlbums.forEach(a => {
            stats[a.id] = {
                count: a.postCount || 0,
                folderCount: a.folderCount || 0,
                totalCount: a.postCount || 0, // User requested exact backend value
                lastDate: a.createdAt || 0
            };
        });

        // ✨ Filter Top Level Albums (No parentId)
        const topLevelAlbums = customAlbums.filter(a => !a.parentId);

        // Sort Albums
        const sortedAlbums = [...topLevelAlbums].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'count') return (stats[b.id].totalCount) - (stats[a.id].totalCount);
            if (sortOption === 'newest') return stats[b.id].lastDate - stats[a.id].lastDate;
            if (sortOption === 'favorites') {
                if (a.isFavorite === b.isFavorite) return a.name.localeCompare(b.name);
                return a.isFavorite ? -1 : 1;
            }
            return 0;
        });

        return { sortedAlbums, stats };
    }, [posts, customAlbums, sortOption]);



    const handleMenuClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActiveDropdownId(activeDropdownId === id ? null : id);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const album = customAlbums.find(a => a.id === id);
        if (!album) return;
        if (confirm(`'${album.name}' 앨범을 정말 삭제하시겠습니까?`)) {
            onDeleteAlbum(id);
            setActiveDropdownId(null);
        }
    };

    const formatStats = (info: { count: number, folderCount: number, totalCount: number }) => {
        const parts = [];
        if (info.folderCount > 0) parts.push(`폴더 ${info.folderCount}개`);
        if (info.totalCount >= 0) parts.push(`기록 ${info.totalCount}개`);
        if (parts.length === 0) return "비어있음";
        return parts.join(' · ');
    };



    return (
        <div>
            {/* 상단 헤더 (Start Writing Buttons etc) - Simplified inline for brevity or reuse existing code structure */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-[var(--border-color)] pb-4 space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <Folder className="text-yellow-400 fill-yellow-400" size={32} />
                        내 앨범
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 ml-1">나만의 추억 보관함입니다.</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    <div className="flex bg-[var(--bg-card-secondary)] rounded-lg p-1 mr-2 h-10 md:h-12 items-center flex-shrink-0">
                        {(['name', 'newest', 'count', 'favorites'] as const).map(opt => (
                            <button
                                key={opt}
                                onClick={() => setSortOption(opt)}
                                className={`px-2 md:px-3 py-1.5 md:py-3 text-[10px] md:text-xs font-bold rounded-md transition-all whitespace-nowrap ${sortOption === opt ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                {{ name: '가나다순', newest: '최신순', count: '많은 기록순', favorites: '⭐ 즐겨찾기' }[opt]}
                            </button>
                        ))}
                    </div>
                    <button onClick={onCreateAlbum} className="flex items-center gap-1 px-3 h-10 md:h-12 rounded-xl border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all font-medium group flex-shrink-0"><Plus size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" /><Folder size={18} className="text-[var(--text-secondary)] group-hover:text-yellow-500 group-hover:fill-yellow-500 transition-colors" /></button>
                    <button onClick={onStartWriting} className="flex items-center gap-2 px-4 md:px-5 h-10 md:h-12 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap flex-shrink-0"><PenLine size={18} />기록 남기기</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* ✨ All Posts Card - Fixed Position */}
                {/* ✨ All Records Album (Replaces Uncategorized) */}
                {albumStats.sortedAlbums.map(album => {
                    const stats = albumStats.stats[album.id];

                    return (
                        <div key={album.id} onClick={() => onAlbumClick(album.id)} className="relative group cursor-pointer">
                            <AlbumBook
                                title={album.name}
                                tag={album.tag || undefined}
                                count={formatStats(stats)}
                                config={album.coverConfig}
                                className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300"
                            />

                            {/* ✨ Room Indicator */}
                            {album.type === 'room' && (
                                <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-sm text-white p-1 rounded-full shadow-sm">
                                    <div className="flex items-center justify-center w-5 h-5">
                                        {album.roomConfig?.password ? <Lock size={12} /> : <Users size={12} />}
                                    </div>
                                </div>
                            )}

                            {/* Favorite Button for Album */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleAlbumFavorite(album.id);
                                }}
                                className={`absolute top-2 left-2 p-1.5 rounded-full z-30 transition-all ${album.isFavorite ? 'text-yellow-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-yellow-400 hover:bg-white/50'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={album.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </button>

                            <div className="absolute top-2 right-2 z-30">
                                <button onClick={(e) => handleMenuClick(e, album.id)} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                    <MoreVertical size={18} />
                                </button>
                                {activeDropdownId === album.id && (
                                    <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                        {/* ✨ Room Info Option */}
                                        {album.type === 'room' && (
                                            <button onClick={(e) => { e.stopPropagation(); setRoomSettingsId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50/50"><Users size={16} /> 모임 정보</button>
                                        )}
                                        {/* Customize Cover: Show for Albums OR Room Owners only */}
                                        {(album.type !== 'room' || album.role === 'OWNER' || (currentUserEmail && album.ownerEmail === currentUserEmail)) && (
                                            <button onClick={(e) => { e.stopPropagation(); setEditingCoverId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                                        )}
                                        {/* Rename & Delete: Hide for Rooms (Managed in Room Info) */}
                                        {album.type !== 'room' && (
                                            <>
                                                <button onClick={(e) => { e.stopPropagation(); setRenamingId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Edit size={16} /> 이름 변경</button>
                                                <button onClick={(e) => handleDeleteClick(e, album.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 size={16} /> 앨범 삭제</button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* ✨ All Records Album (Moved to End) */}
                <div onClick={() => onAlbumClick('__all__')} className="relative group cursor-pointer">
                    <AlbumBook
                        title="모든 기록 보관함"
                        count={`기록 ${posts.length}개`}
                        // config={coverConfigs['__all__']} // Removed LS
                        className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300"
                        showFullTitle={true}
                    />
                    {/* Helper Menu for Cover Customization */}
                    <div className="absolute top-2 right-2 z-30">
                        <button onClick={(e) => handleMenuClick(e, '__all__')} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                            <MoreVertical size={18} />
                        </button>
                        {activeDropdownId === '__all__' && (
                            <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); setEditingCoverId('__all__'); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                            </div>
                        )}
                    </div>
                </div>



            </div>

            {/* Modals */}
            {/* 이름 변경 모달 - Need to fetch name from key */}
            <RenameAlbumModal
                isOpen={!!renamingId}
                onClose={() => setRenamingId(null)}
                // We need to resolve Name/Tag from ID to pass to legacy handler
                onSave={(newName) => {
                    if (renamingId) {
                        onUpdateAlbum(renamingId, { name: newName });
                        setRenamingId(null);
                    }
                }}
                currentName={renamingId ? customAlbums.find(a => a.id === renamingId)?.name || '' : ''}
            />
            {editingCoverId && (
                <CoverCustomizer
                    albumTitle={editingCoverId === '__all__' ? '모든 기록 보관함' : editingCoverId === '__others__' ? '미분류 보관함' : (customAlbums.find(a => a.id === editingCoverId)?.name || '')}
                    albumTag={(editingCoverId === '__all__' || editingCoverId === '__others__') ? undefined : (customAlbums.find(a => a.id === editingCoverId)?.tag || undefined)}
                    initialConfig={(editingCoverId === '__all__' || editingCoverId === '__others__') ? undefined : (customAlbums.find(a => a.id === editingCoverId)?.coverConfig || undefined)}
                    onSave={handleSaveCover}
                    onClose={() => setEditingCoverId(null)}
                />
            )}

            {/* ✨ Room Settings Modal */}
            {roomSettingsId && (
                <RoomSettingsModal
                    isOpen={!!roomSettingsId}
                    onClose={() => setRoomSettingsId(null)}
                    album={customAlbums.find(a => a.id === roomSettingsId)!}
                />
            )}
        </div>
    );
};

export default PostAlbumPage;
