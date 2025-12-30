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
    onAlbumClick: (tagName: string | null) => void;
    onCreateAlbum: () => void;
    onStartWriting: () => void;
    onRenameAlbum: (oldName: string, newName: string) => void;
    onDeleteAlbum: (albumName: string) => void;
}

const PostAlbumPage: React.FC<Props> = ({ posts, customAlbums, onAlbumClick, onCreateAlbum, onStartWriting, onRenameAlbum, onDeleteAlbum }) => {
    const [activeDropdownAlbum, setActiveDropdownAlbum] = useState<string | null>(null);
    const [renamingAlbum, setRenamingAlbum] = useState<string | null>(null);
    const [coverConfigs, setCoverConfigs] = useState<Record<string, AlbumCoverConfig>>({});
    const [editingCoverAlbum, setEditingCoverAlbum] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<'name' | 'count' | 'newest'>('name');

    // Load covers from localStorage on mount and listen for updates
    useEffect(() => {
        const loadCovers = () => {
            const stored = localStorage.getItem('album_covers_v1');
            if (stored) {
                try {
                    setCoverConfigs(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse album covers", e);
                }
            }
        };

        loadCovers();

        const handleUpdate = () => loadCovers();
        window.addEventListener('album_cover_update', handleUpdate);
        return () => window.removeEventListener('album_cover_update', handleUpdate);
    }, []);

    const handleSaveCover = (config: AlbumCoverConfig) => {
        if (!editingCoverAlbum) return;

        setCoverConfigs(prev => {
            const next = { ...prev, [editingCoverAlbum]: config };
            localStorage.setItem('album_covers_v1', JSON.stringify(next));
            return next;
        });
        setEditingCoverAlbum(null);
    };

    // 태그별로 포스트 그룹화 (커스텀 앨범 포함) 및 정렬
    const sortedAlbums = useMemo(() => {
        // 1. 그룹화
        const groups: Record<string, number> = {};
        customAlbums.forEach(album => {
            groups[album.name] = 0;
        });

        const albumLastDates: Record<string, number> = {}; // 최신순 정렬용
        let othersCount = 0;

        posts.forEach(post => {
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => {
                    groups[tag] = (groups[tag] || 0) + 1;

                    const postDate = new Date(post.date).getTime();
                    if (!albumLastDates[tag] || postDate > albumLastDates[tag]) {
                        albumLastDates[tag] = postDate;
                    }
                });
            } else {
                othersCount++;
            }
        });

        // 2. 정렬
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (sortOption === 'name') {
                return a.localeCompare(b);
            } else if (sortOption === 'count') {
                return groups[b] - groups[a]; // 내림차순
            } else if (sortOption === 'newest') {
                // 커스텀 앨범의 생성 시간 찾기
                const getCreationDate = (name: string) => {
                    const album = customAlbums.find(ca => ca.name === name);
                    return album?.createdAt || 0;
                };

                const dateA = Math.max(albumLastDates[a] || 0, getCreationDate(a));
                const dateB = Math.max(albumLastDates[b] || 0, getCreationDate(b));
                return dateB - dateA; // 내림차순
            }
            return 0;
        });

        return { groups, sortedKeys, othersCount };
    }, [posts, customAlbums, sortOption]);

    // 앨범 메뉴 핸들러
    const handleMenuClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        setActiveDropdownAlbum(activeDropdownAlbum === albumName ? null : albumName);
    };

    const handleDeleteClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        if (confirm(`'${albumName}' 앨범을 정말 삭제하시겠습니까?\n포함된 모든 글과 폴더가 함께 삭제됩니다.`)) {
            onDeleteAlbum(albumName);
            setActiveDropdownAlbum(null);
        }
    };

    const handleRenameClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        setRenamingAlbum(albumName);
        setActiveDropdownAlbum(null);
    };

    const handleEditCoverClick = (e: React.MouseEvent, albumName: string) => {
        e.stopPropagation();
        setEditingCoverAlbum(albumName);
        setActiveDropdownAlbum(null);
    };

    const handleRenameSave = (newName: string) => {
        if (renamingAlbum) {
            onRenameAlbum(renamingAlbum, newName);
            setRenamingAlbum(null);
        }
    };

    return (
        <div>
            {/* 상단 헤더 */}
            <div className="flex justify-between items-end mb-8 border-b border-[var(--border-color)] pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                        <Folder className="text-yellow-400 fill-yellow-400" size={32} />
                        내 앨범
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-2 ml-1">태그로 자동 분류된 나의 기록들입니다.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 정렬 옵션 */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setSortOption('name')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortOption === 'name' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            가나다순
                        </button>
                        <button
                            onClick={() => setSortOption('newest')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortOption === 'newest' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            최신순
                        </button>
                        <button
                            onClick={() => setSortOption('count')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortOption === 'count' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            많은 기록순
                        </button>
                    </div>

                    <button
                        onClick={onCreateAlbum}
                        className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] transition-all font-medium group"
                    >
                        <Plus size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                        <Folder size={18} className="text-[var(--text-secondary)] group-hover:text-yellow-500 transition-colors" />
                    </button>
                    <button
                        onClick={onStartWriting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20"
                    >
                        <PenLine size={18} />
                        기록 남기기
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {/* 태그 앨범들 (정렬됨) */}
                {sortedAlbums.sortedKeys.map(tagName => {
                    const count = sortedAlbums.groups[tagName];
                    const customAlbum = customAlbums.find(a => a.name === tagName);
                    // 커스텀 앨범이면 설정된 태그를 사용(없으면 숨김), 자동 태그 앨범이면 태그명을 그대로 사용
                    const displayTag = customAlbum ? (customAlbum.tag || undefined) : tagName;

                    return (
                        <div
                            key={tagName}
                            onClick={() => onAlbumClick(tagName)}
                            className="relative group cursor-pointer"
                        >
                            {/* Album Book Component */}
                            <AlbumBook
                                title={tagName}
                                tag={displayTag} // ✨ Use resolved tag
                                count={count}
                                config={coverConfigs[tagName]}
                                className="shadow-sm border border-transparent group-hover:shadow-md transition-all"
                            />

                            {/* 상단 메뉴 버튼: 우측 상단 절대 위치 */}
                            <div className="absolute top-2 right-2 z-30">
                                <button
                                    onClick={(e) => handleMenuClick(e, tagName)}
                                    className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {activeDropdownAlbum === tagName && (
                                    <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-bold text-gray-500">앨범 관리</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleEditCoverClick(e, tagName)}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                        >
                                            <Sparkles size={16} /> 표지 꾸미기
                                        </button>
                                        <button
                                            onClick={(e) => handleRenameClick(e, tagName)}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                        >
                                            <Edit size={16} /> 이름 변경
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, tagName)}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                        >
                                            <Trash2 size={16} /> 앨범 삭제
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* 기타 앨범 (미분류) */}
                {(sortedAlbums.othersCount > 0 || sortedAlbums.sortedKeys.length === 0) && (
                    <div
                        onClick={() => onAlbumClick(null)}
                        className="relative group cursor-pointer"
                    >
                        <AlbumBook
                            title="미분류 보관함"
                            tag="미분류" // Explicit tag for Others
                            count={sortedAlbums.othersCount}
                            config={coverConfigs['__others__'] || undefined} // Special key for others
                            className="shadow-sm border border-transparent group-hover:shadow-md transition-all opacity-90"
                        />

                        {/* Menu for Others Album */}
                        <div className="absolute top-2 right-2 z-30">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuClick(e, '__others__');
                                }}
                                className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors bg-white/90 backdrop-blur-sm rounded-full shadow-sm"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {/* Dropdown for Others */}
                            {activeDropdownAlbum === '__others__' && (
                                <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-xl w-48 py-2 z-50 animate-scale-up origin-top-right cursor-default" onClick={e => e.stopPropagation()}>
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-500">앨범 관리</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleEditCoverClick(e, '__others__')}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Sparkles size={16} /> 표지 꾸미기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 이름 변경 모달 */}
            <RenameAlbumModal
                isOpen={!!renamingAlbum}
                onClose={() => setRenamingAlbum(null)}
                onSave={handleRenameSave}
                currentName={renamingAlbum || ''}
            />

            {/* 표지 꾸미기 모달 */}
            {editingCoverAlbum && (
                <CoverCustomizer
                    albumTitle={editingCoverAlbum === '__others__' ? '미분류 보관함' : editingCoverAlbum}
                    albumTag={customAlbums.find(a => a.name === editingCoverAlbum)?.tag || undefined} // ✨ Pass correct tag
                    initialConfig={coverConfigs[editingCoverAlbum]}
                    onSave={handleSaveCover}
                    onClose={() => setEditingCoverAlbum(null)}
                />
            )}
        </div>
    );
};

export default PostAlbumPage;
