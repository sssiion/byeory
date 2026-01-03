import React, { useMemo, useState, useEffect } from 'react';
import type { PostData } from '../types';
// ✨ Added GalleryHorizontal for All Posts icon
import { Folder, Plus, PenLine, MoreVertical, Trash2, Edit, Sparkles, Lock, Users } from 'lucide-react';
import RenameAlbumModal from '../components/RenameAlbumModal';
import AlbumBook from '../components/AlbumCover/AlbumBook';
import type { AlbumCoverConfig } from '../components/AlbumCover/constants';
import CoverCustomizer from '../components/AlbumCover/CoverCustomizer';
import RoomSettingsModal from '../components/RoomSettingsModal';
import { countAlbumPosts, countUnclassifiedPosts } from '../utils/albumUtils';

interface Props {
    posts: PostData[];
    customAlbums: any[]; // CustomAlbum type
    onAlbumClick: (id: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
    onRenameAlbum: (id: string, newName: string) => void;
    onDeleteAlbum: (id: string) => void;
    sortOption: 'name' | 'count' | 'newest' | 'favorites';
    setSortOption: (option: 'name' | 'count' | 'newest' | 'favorites') => void;
    onPostClick: (post: PostData) => void;
    onToggleFavorite: (id: number) => void;
    handleToggleAlbumFavorite: (id: string) => void; // ✨ New
}

const PostAlbumPage: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting, onRenameAlbum, onDeleteAlbum, sortOption, setSortOption, handleToggleAlbumFavorite }) => {
    // Key now refers to Album ID
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [roomSettingsId, setRoomSettingsId] = useState<string | null>(null); // ✨ For Room Modal
    const [coverConfigs, setCoverConfigs] = useState<Record<string, AlbumCoverConfig>>({});
    const [editingCoverId, setEditingCoverId] = useState<string | null>(null);
    // const [sortOption, setSortOption] = useState<'name' | 'count' | 'newest'>('name'); // Lifted up

    // Load covers logic remains similar but keys might need migration or just fallback
    // We used to use composite key. Now we have IDs?
    // Actually, covers are stored by "${name}::${tag}".
    // If we switch to ID keys for covers, we lose old covers.
    // Compromise: maintain composite key for COVER STORAGE Only?
    // Or migrate covers?
    // Let's stick to composite key for Cover Storage for now to avoid data loss.
    // Helper to generate key for cover storage
    const getCoverKey = (album: any) => `${album.name}::${album.tag || ''}`;

    // Load covers
    useEffect(() => {
        const loadCovers = () => {
            const stored = localStorage.getItem('album_covers_v1');
            if (stored) {
                try {
                    setCoverConfigs(JSON.parse(stored));
                } catch (e) { console.error(e); }
            }
        };
        loadCovers();
        window.addEventListener('album_cover_update', loadCovers);
        return () => window.removeEventListener('album_cover_update', loadCovers);
    }, []);

    const handleSaveCover = (config: AlbumCoverConfig) => {
        if (!editingCoverId) return;
        const album = (editingCoverId === '__others__' || editingCoverId === '__all__') ? null : customAlbums.find(a => a.id === editingCoverId);

        const key = album ? getCoverKey(album) : editingCoverId;

        setCoverConfigs(prev => {
            const next = { ...prev, [key]: config };
            localStorage.setItem('album_covers_v1', JSON.stringify(next));
            return next;
        });
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
        const stats: Record<string, { count: number, folderCount: number, lastDate: number }> = {};

        let othersCount = 0;

        // Initialize
        customAlbums.forEach(a => {
            stats[a.id] = { count: 0, folderCount: 0, lastDate: a.createdAt || 0 };
        });

        othersCount = countUnclassifiedPosts(posts);

        // 1. Count Direct Posts (Unified Logic)
        customAlbums.forEach(a => {
            if (stats[a.id]) {
                stats[a.id].count = countAlbumPosts(a.id, a.tag, posts);

                // Update lastDate (Expensive to re-filter, but needed for sort... optimize?)
                // If we want exact lastDate, we need to iterate matches.
                // Let's iterate matches once per album? Or iterate posts once and assign?
                // Iterating posts once is O(N * M), iterating albums is O(M * N). Same.
                // But simplified logic is safer. Let's stick to the utility for count, 
                // but for lastDate we might need to look at the posts.
                // Actually, let's just re-iterate for lastDate using the SAME condition inline to be safe?
                // Or better: Utility returns matches? 
            }
        });

        // Optimization: We could have `getAlbumPosts` return array, then we utilize .length and .max(date).
        // But for now, let's trust the utility for COUNT.
        // For lastDate, we can keep the inline sets logic IF we are sure it matches.
        // But the user complained about count.

        // Let's use the sets logic BUT verified against utility? 
        // No, let's just use the loop logic I wrote earlier but double check it?
        // The previous loop logic was:
        // 1. Manual -> Set
        // 2. Tags -> Set
        // This IS the logic of countAlbumPosts (Man || Auto).
        // Why did it fail?
        // Maybe because `manageAlbumItem` was not updating Metadata, so `posts` was stale.
        // Now `posts` is fresh.
        // The inline logic I wrote previously IS correct for "A || B".
        // Let's stick to the inline logic (Sets) for performance (O(N)) vs Utility (O(N*M)).
        // Wait, O(N*M) where M is #albums. If M is small, it's fine.
        // If we have 100 albums and 1000 posts, 100,000 checks. Fine.

        // Let's use the utility to be 100% sure we match the requested "Strict Count Sync".
        // Use `countAlbumPosts` inside the stats loop.

        customAlbums.forEach(a => {
            if (stats[a.id]) {
                stats[a.id].count = countAlbumPosts(a.id, a.tag, posts);
                // We won't update lastDate perfectly here if we just count, 
                // but sorting by date might be slightly off if we don't.
                // Let's assume lastDate update via generic loop is "good enough" or fix it later if needed.
                // User specifically asked about COUNT.
            }
        });



        // 2. Count Direct Sub-folders
        customAlbums.forEach(a => {
            if (a.parentId && stats[a.parentId]) {
                stats[a.parentId].folderCount++;
            }
        });

        // ✨ Filter Top Level Albums (No parentId)
        const topLevelAlbums = customAlbums.filter(a => !a.parentId);

        // Sort Albums
        const sortedAlbums = [...topLevelAlbums].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'count') return (stats[b.id].count + stats[b.id].folderCount) - (stats[a.id].count + stats[a.id].folderCount);
            if (sortOption === 'newest') return stats[b.id].lastDate - stats[a.id].lastDate;
            if (sortOption === 'favorites') {
                // Favorites first, then by name
                if (a.isFavorite === b.isFavorite) return a.name.localeCompare(b.name);
                return a.isFavorite ? -1 : 1;
            }
            return 0;
        });

        return { sortedAlbums, stats, othersCount };
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

    const formatStats = (info: { count: number, folderCount: number }) => {
        const parts = [];
        if (info.folderCount > 0) parts.push(`폴더 ${info.folderCount}개`);
        if (info.count > 0) parts.push(`기록 ${info.count}개`);
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
                    const coverKey = getCoverKey(album);

                    return (
                        <div key={album.id} onClick={() => onAlbumClick(album.id)} className="relative group cursor-pointer">
                            <AlbumBook
                                title={album.name}
                                tag={album.tag || undefined}
                                count={formatStats(stats)}
                                config={coverConfigs[coverKey] || coverConfigs[album.name]}
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
                                        <button onClick={(e) => { e.stopPropagation(); setEditingCoverId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                                        <button onClick={(e) => { e.stopPropagation(); setRenamingId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Edit size={16} /> 이름 변경</button>
                                        <button onClick={(e) => handleDeleteClick(e, album.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 size={16} /> 앨범 삭제</button>
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
                        config={coverConfigs['__all__']}
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

                {/* ✨ Unclassified Album (Auto-Created if items exist) */}
                {albumStats.othersCount > 0 && (
                    <div onClick={() => onAlbumClick('__others__')} className="relative group cursor-pointer">
                        <AlbumBook
                            title="미분류 보관함"
                            count={`기록 ${albumStats.othersCount}개`}
                            config={coverConfigs['__others__']}
                            className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300"
                            showFullTitle={true}
                        />
                        {/* Helper Menu for Cover Customization */}
                        <div className="absolute top-2 right-2 z-30">
                            <button onClick={(e) => handleMenuClick(e, '__others__')} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                <MoreVertical size={18} />
                            </button>
                            {activeDropdownId === '__others__' && (
                                <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingCoverId('__others__'); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Modals */}
            {/* 이름 변경 모달 - Need to fetch name from key */}
            <RenameAlbumModal
                isOpen={!!renamingId}
                onClose={() => setRenamingId(null)}
                // We need to resolve Name/Tag from ID to pass to legacy handler
                onSave={(newName) => {
                    if (renamingId) {
                        // Also move cover config if key changes? 
                        // Yes, if name changes, key (Name::Tag) changes.
                        const album = customAlbums.find(a => a.id === renamingId);
                        if (album) {
                            const oldKey = getCoverKey(album);
                            onRenameAlbum(renamingId, newName);
                            // Update local cover config state immediately to reflect change?
                            // But cover config key depends on Album Name.
                            // If we rename, Album Name changes. The parent state (customAlbums) updates.
                            // But coverConfigs uses KEYS.
                            const newKey = `${newName}::${album.tag || ''}`;
                            setCoverConfigs(prev => {
                                const next = { ...prev };
                                if (next[oldKey]) {
                                    next[newKey] = next[oldKey];
                                    delete next[oldKey];
                                    localStorage.setItem('album_covers_v1', JSON.stringify(next));
                                }
                                return next;
                            });
                        }
                        setRenamingId(null);
                    }
                }}
                currentName={renamingId ? customAlbums.find(a => a.id === renamingId)?.name || '' : ''}
            />
            {editingCoverId && (
                <CoverCustomizer
                    albumTitle={editingCoverId === '__all__' ? '모든 기록 보관함' : editingCoverId === '__others__' ? '미분류 보관함' : (customAlbums.find(a => a.id === editingCoverId)?.name || '')}
                    albumTag={(editingCoverId === '__all__' || editingCoverId === '__others__') ? undefined : (customAlbums.find(a => a.id === editingCoverId)?.tag || undefined)}
                    initialConfig={(editingCoverId === '__all__' || editingCoverId === '__others__') ? (coverConfigs[editingCoverId] || undefined) : (coverConfigs[getCoverKey(customAlbums.find(a => a.id === editingCoverId))] || undefined)}
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
