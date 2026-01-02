// ✨ Import customAlbum for props
import React, { useState } from 'react';
import CreateFolderModal from '../components/CreateFolderModal';
import type { PostData } from '../types';
import { ArrowLeft, Home, Folder, PenLine, Trash2 } from 'lucide-react';
import PostBreadcrumb, { type BreadcrumbItem } from '../components/PostBreadcrumb';

interface Props {
    albumId: string | null;
    posts: PostData[];
    allPosts: PostData[]; // ✨ Needed for sub-album stats
    onBack: () => void;
    onPostClick: (post: PostData) => void;
    onStartWriting: (initialAlbumId?: string) => void;
    onCreateAlbum: (name: string, tags: string[], parentId?: string | null) => void; // Update signature
    // ✨ New Prop for looking up sub-albums
    customAlbums: any[];
    onAlbumClick: (id: string | null) => void;
    onDeletePost: (id: number | string) => void;
    onDeleteAlbum: (id: string) => void;
    onToggleFavorite: (id: number) => void; // ✨ New Prop
}

const PostFolderPage: React.FC<Props> = ({ albumId, posts, allPosts, onBack, onPostClick, onStartWriting, onCreateAlbum, customAlbums, onAlbumClick, onDeletePost, onDeleteAlbum, onToggleFavorite }) => {
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // ✨ Generic Helper to get parent chain
    const getParentChain = (currentId: string | null, allAlbums: any[]): any[] => {
        const chain: any[] = [];
        let curr = allAlbums.find(a => a.id === currentId);
        while (curr) {
            chain.unshift(curr); // Add to beginning
            if (!curr.parentId) break; // Top level
            curr = allAlbums.find(a => a.id === curr!.parentId);
            // Basic loop protection for circular refs (though shouldn't happen)
            if (chain.length > 20) break;
        }
        return chain;
    };

    // ✨ Build Breadcrumb Items
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: '내 앨범', icon: Home, onClick: onBack }, // Base (clicks back to root)
    ];

    if (albumId === '__others__') {
        breadcrumbItems.push({ label: '미분류 보관함', icon: Folder });
    } else if (albumId === '__all__') {
        breadcrumbItems.push({ label: '모든 기록 보관함', icon: Folder });
    } else {
        breadcrumbItems.push(...getParentChain(albumId, customAlbums).map((album, index, array) => {
            const isLast = index === array.length - 1;
            return {
                label: album.name,
                icon: Folder,
                onClick: isLast ? undefined : () => onAlbumClick(album.id)
            };
        }));
    }

    // ✨ Filter sub-folders
    // If __all__, show All Root Albums (those without parents)
    const subAlbums = albumId === '__all__'
        ? customAlbums.filter(a => !a.parentId)
        : customAlbums.filter(a => a.parentId === albumId);

    // ✨ Calculate stats for sub-albums (Preview)
    const getSubAlbumStats = (subAlbumId: string) => {
        // Direct posts count (Use allPosts to find posts that might not be in current filtered view)
        const postCount = allPosts.filter(p => p.albumIds?.includes(subAlbumId) || p.tags?.some(t => customAlbums.find(a => a.id === subAlbumId)?.tag === t)).length;
        // Sub-sub folders?
        const folderCount = customAlbums.filter(a => a.parentId === subAlbumId).length;

        return `폴더 ${folderCount}개 · 기록 ${postCount}개`;
    };

    const handleCreateFolder = (name: string) => {
        onCreateAlbum(name, [], albumId); // Create with parentId
    };

    return (
        <div>
            {/* 상단 네비게이션 (Breadcrumb) */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            // Smart Back: Go to parent of current album, or Root
                            const parent = customAlbums.find(a => a.id === albumId)?.parentId;
                            onAlbumClick(parent || null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center text-sm">
                        <PostBreadcrumb items={breadcrumbItems} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {albumId !== '__all__' && (
                        <>
                            <button
                                onClick={() => setIsCreateFolderOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                                <Folder size={16} />
                                폴더 추가
                            </button>
                            <button
                                onClick={() => onStartWriting(albumId || undefined)}
                                className="flex items-center gap-2 px-5 h-9 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20"
                            >
                                <PenLine size={18} />
                                기록 남기기
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ✨ Sub-Albums (Folders) Display */}
            {subAlbums.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Folder size={20} className="text-yellow-500" />
                        폴더
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {subAlbums.map(album => (
                            <div
                                key={album.id}
                                onClick={() => onAlbumClick(album.id)}
                                className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center gap-2 group relative"
                            >
                                {/* ✨ Delete Folder Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`'${album.name}' 폴더와 그 안의 모든 내용이 삭제됩니다.\n계속하시겠습니까?`)) {
                                            onDeleteAlbum(album.id);
                                        }
                                    }}
                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <Folder size={40} className="text-indigo-200 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-bold text-[var(--text-primary)] truncate max-w-full text-center">{album.name}</span>
                                <span className="text-[10px] text-[var(--text-secondary)]">{getSubAlbumStats(album.id)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 글 목록 */}
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">기록들 ({posts.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400">
                        {subAlbums.length > 0 ? "폴더를 선택하거나 기록을 남겨보세요." : "이 폴더에는 아직 글이 없습니다."}
                    </div>
                ) : (
                    posts.map(p => (
                        <div key={p.id} onClick={() => onPostClick(p)} className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md cursor-pointer transition transform hover:-translate-y-1 relative group">
                            <div className="text-4xl mb-4">📜</div>

                            {/* ✨ Delete Button (Visible on Hover) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('정말 삭제하시겠습니까?')) {
                                        onDeletePost(p.id);
                                    }
                                }}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={18} />
                            </button>

                            {/* ✨ Favorite Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(p.id);
                                }}
                                className={`absolute top-4 ${p.isFavorite ? 'right-12 opacity-100' : 'right-12 opacity-0 group-hover:opacity-100'} p-2 rounded-full transition-all ${p.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={p.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </button>

                            <h3 className="font-bold text-lg truncate text-[var(--text-primary)]">{p.title}</h3>
                            <p className="text-[var(--text-secondary)] text-sm">{p.date}</p>
                            {/* 태그 표시 */}
                            {p.tags && p.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                    {p.tags.map(t => (
                                        <span key={t} className="text-xs px-2 py-1 bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] rounded-full">#{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                onCreate={handleCreateFolder}
            />
        </div>
    );
};

export default PostFolderPage;
