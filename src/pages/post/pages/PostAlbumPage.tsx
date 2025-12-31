import React, { useMemo, useState, useEffect } from 'react';
import type { PostData } from '../types';
import { Folder, Plus, PenLine, MoreVertical, Trash2, Edit, Sparkles } from 'lucide-react';
import RenameAlbumModal from '../components/RenameAlbumModal';
import AlbumBook from '../components/AlbumCover/AlbumBook';
import type { AlbumCoverConfig } from '../components/AlbumCover/constants';
import CoverCustomizer from '../components/AlbumCover/CoverCustomizer';

interface Props {
    posts: PostData[];
    customAlbums: any[]; // CustomAlbum type
    onAlbumClick: (id: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
    onRenameAlbum: (id: string, newName: string) => void;
    onDeleteAlbum: (id: string) => void;
    sortOption: 'name' | 'count' | 'newest';
    setSortOption: (option: 'name' | 'count' | 'newest') => void;
}

const PostAlbumPage: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting, onRenameAlbum, onDeleteAlbum, sortOption, setSortOption }) => {
    // Key now refers to Album ID
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
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
        const album = editingCoverId === '__others__' ? null : customAlbums.find(a => a.id === editingCoverId);

        const key = album ? getCoverKey(album) : '__others__';

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
        const stats: Record<string, { count: number, lastDate: number }> = {};

        // Initialize
        customAlbums.forEach(a => {
            stats[a.id] = { count: 0, lastDate: a.createdAt || 0 };
        });

        let othersCount = 0;

        posts.forEach(post => {
            let matched = false;

            // 1. ID Match
            if (post.albumIds && post.albumIds.length > 0) {
                post.albumIds.forEach(id => {
                    if (stats[id]) {
                        stats[id].count++;
                        matched = true;
                        const d = new Date(post.date).getTime();
                        if (d > stats[id].lastDate) stats[id].lastDate = d;
                    }
                });
            }

            // 2. Legacy Tag Match (only if not matched via ID?)
            // If a post has IDs, we assume it's fully migrated/managed.
            // If it has NO IDs, fallback to tags.
            if (!post.albumIds || post.albumIds.length === 0) {
                if (post.tags) {
                    post.tags.forEach(tag => {
                        // Find albums with this tag
                        const matchingAlbums = customAlbums.filter(a => a.tag === tag);
                        if (matchingAlbums.length > 0) {
                            matched = true;
                            matchingAlbums.forEach(a => {
                                stats[a.id].count++;
                                const d = new Date(post.date).getTime();
                                if (d > stats[a.id].lastDate) stats[a.id].lastDate = d;
                            });
                        }
                    });
                }
            }

            if (!matched) othersCount++;
        });

        // ✨ Filter Top Level Albums (No parentId)
        const topLevelAlbums = customAlbums.filter(a => !a.parentId);

        // Sort Albums
        const sortedAlbums = [...topLevelAlbums].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'count') return stats[b.id].count - stats[a.id].count;
            if (sortOption === 'newest') return stats[b.id].lastDate - stats[a.id].lastDate;
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

    return (
        <div>
            {/* 상단 헤더 (Start Writing Buttons etc) - Simplified inline for brevity or reuse existing code structure */}
            <div className="flex justify-between items-end mb-8 border-b border-[var(--border-color)] pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <Folder className="text-yellow-400 fill-yellow-400" size={32} />
                        내 앨범
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 ml-1">나만의 추억 보관함입니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-card-secondary)] rounded-lg p-1 mr-2 h-9 items-center">
                        {(['name', 'newest', 'count'] as const).map(opt => (
                            <button
                                key={opt}
                                onClick={() => setSortOption(opt)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortOption === opt ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                {{ name: '가나다순', newest: '최신순', count: '많은 기록순' }[opt]}
                            </button>
                        ))}
                    </div>
                    <button onClick={onCreateAlbum} className="flex items-center gap-1 px-3 h-9 rounded-xl border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all font-medium group"><Plus size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" /><Folder size={18} className="text-[var(--text-secondary)] group-hover:text-yellow-500 transition-colors" /></button>
                    <button onClick={onStartWriting} className="flex items-center gap-2 px-5 h-9 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20"><PenLine size={18} />기록 남기기</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albumStats.sortedAlbums.map(album => {
                    const count = albumStats.stats[album.id].count;
                    const coverKey = getCoverKey(album);

                    return (
                        <div key={album.id} onClick={() => onAlbumClick(album.id)} className="relative group cursor-pointer">
                            <AlbumBook
                                title={album.name}
                                tag={album.tag || undefined}
                                count={count}
                                config={coverConfigs[coverKey] || coverConfigs[album.name]}
                                className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300"
                            />
                            <div className="absolute top-2 right-2 z-30">
                                <button onClick={(e) => handleMenuClick(e, album.id)} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                                    <MoreVertical size={18} />
                                </button>
                                {activeDropdownId === album.id && (
                                    <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                        <button onClick={(e) => { e.stopPropagation(); setEditingCoverId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Sparkles size={16} /> 표지 꾸미기</button>
                                        <button onClick={(e) => { e.stopPropagation(); setRenamingId(album.id); setActiveDropdownId(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Edit size={16} /> 이름 변경</button>
                                        <button onClick={(e) => handleDeleteClick(e, album.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 size={16} /> 앨범 삭제</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Others Album */}
                {(albumStats.othersCount > 0 || albumStats.sortedAlbums.length === 0) && (
                    <div onClick={() => onAlbumClick(null)} className="relative group cursor-pointer">
                        <AlbumBook title="미분류 보관함" count={albumStats.othersCount} config={coverConfigs['__others__']} className="shadow-sm border border-transparent group-hover:shadow-md transition-shadow duration-300" showFullTitle={true} />
                        <div className="absolute top-2 right-2 z-30">
                            <button onClick={(e) => handleMenuClick(e, '__others__')} className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm"><MoreVertical size={18} /></button>
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
                    albumTitle={editingCoverId === '__others__' ? '미분류 보관함' : customAlbums.find(a => a.id === editingCoverId)?.name || ''}
                    albumTag={editingCoverId === '__others__' ? undefined : (customAlbums.find(a => a.id === editingCoverId)?.tag || undefined)}
                    initialConfig={editingCoverId === '__others__' ? (coverConfigs['__others__'] || undefined) : (coverConfigs[getCoverKey(customAlbums.find(a => a.id === editingCoverId))] || undefined)}
                    onSave={handleSaveCover}
                    onClose={() => setEditingCoverId(null)}
                />
            )}
        </div>
    );
};

export default PostAlbumPage;
