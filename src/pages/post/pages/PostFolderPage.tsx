// ✨ Import customAlbum for props
import React, { useState } from 'react';
import CreateFolderModal from '../components/CreateFolderModal';
import type { PostData } from '../types';
import { ArrowLeft, Folder, PenLine, Trash2 } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, useSensors, useSensor, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// ✨ Helper Components for DnD
const DraggablePost = ({ id, children }: { id: string | number, children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: id });
    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none' // ✨ Mobile optimization
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
};

const DroppableFolder = ({ id, children }: { id: string, children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: id });
    const style = {
        transform: isOver ? 'scale(1.05)' : undefined,
        transition: 'transform 0.2s ease',
        boxShadow: isOver ? '0 0 0 2px var(--btn-bg, #6366f1)' : undefined,
        borderRadius: '12px'
    };
    return (
        <div ref={setNodeRef} style={style}>
            {children}
        </div>
    );
};

interface Props {
    albumId: string | null;
    posts: PostData[];
    allPosts: PostData[]; // ✨ Needed for sub-album stats
    // onBack: () => void; // Unused
    onPostClick: (post: PostData) => void;
    onStartWriting: (initialAlbumId?: string) => void;
    onCreateAlbum: (name: string, tags: string[], parentId?: string | null) => string | null; // Update signature
    // ✨ New Prop for looking up sub-albums
    customAlbums: any[];
    onAlbumClick: (id: string | null) => void;
    onDeletePost: (id: number | string) => void;
    onDeleteAlbum: (id: string) => void;
    onToggleFavorite: (id: number) => void; // ✨ New Prop
    onMovePost: (postId: string | number, targetAlbumId: string | null) => void; // ✨ DnD Prop
}

const PostFolderPage: React.FC<Props> = ({ albumId, posts, allPosts, onPostClick, onStartWriting, onCreateAlbum, customAlbums, onAlbumClick, onDeletePost, onDeleteAlbum, onToggleFavorite, onMovePost }) => {
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // ✨ Use Breadcrumb Hook
    const breadcrumbItems = useBreadcrumbs(albumId, customAlbums, onAlbumClick);

    // ✨ Filter sub-folders
    let subAlbums = albumId === '__all__'
        ? customAlbums.filter(a => a.parentId) // ✨ Show ONLY sub-folders in All Records
        : customAlbums.filter(a => a.parentId === albumId);

    // ✨ Virtual Folder: "Unclassified" inside "All Records"
    // Only show if there are actually unclassified posts
    if (albumId === '__all__') {
        const unclassifiedCount = allPosts.filter(p => !p.albumIds || p.albumIds.length === 0).length;
        if (unclassifiedCount > 0) {
            subAlbums = [{
                id: '__others__',
                name: '미분류',
                tag: null,
                parentId: '__all__', // Virtual parent
                isFavorite: false
            }, ...subAlbums];
        }
    }

    // ✨ Calculate stats for sub-albums (Preview)
    const getSubAlbumStats = (subAlbumId: string) => {
        if (subAlbumId === '__others__') {
            const count = allPosts.filter(p => !p.albumIds || p.albumIds.length === 0).length;
            return `기록 ${count}개`;
        }
        const postCount = allPosts.filter(p => p.albumIds?.includes(subAlbumId) || p.tags?.some(t => customAlbums.find(a => a.id === subAlbumId)?.tag === t)).length;
        return `기록 ${postCount}개`;
    };

    const handleCreateFolder = (name: string) => {
        return onCreateAlbum(name, [], albumId);
    };

    // ✨ Handle Drag End
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Check if dropped on a folder
        const targetFolderId = String(over.id);
        const isActivePost = posts.some(p => String(p.id) === String(active.id));
        const isTargetFolder = subAlbums.some(a => a.id === targetFolderId);

        if (isActivePost && isTargetFolder) {
            onMovePost(active.id, targetFolderId);
        }
    };

    // ✨ DnD Sensors (Prevent click blocking)
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // 10px movement required to start drag
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Press and hold 250ms to start drag
                tolerance: 5,
            },
        })
    );

    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
            <div>
                {/* 상단 네비게이션 (Breadcrumb) - ✨ Increased Z-Index to avoid blocking */}
                <div className="flex items-center justify-between mb-8 relative z-50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
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
                        {albumId !== '__all__' && !customAlbums.find(a => a.id === albumId)?.parentId && (
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

                {/* ✨ Sub-Albums (Folders) Display - Droppable */}
                {subAlbums.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Folder size={20} className="text-yellow-500" />
                            {albumId === '__all__' ? '모든 폴더' :
                                albumId === '__others__' ? '미분류 보관함의 폴더' :
                                    `${customAlbums.find(a => a.id === albumId)?.name || '폴더'}의 폴더`}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {subAlbums.map(album => (
                                <DroppableFolder key={album.id} id={album.id}>
                                    <div
                                        onClick={() => onAlbumClick(album.id)}
                                        className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center gap-2 group relative h-full"
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

                                        {/* ✨ Parent Name Indication */}
                                        {albumId === '__all__' && album.parentId && album.parentId !== '__all__' && (
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full mb-1">
                                                {customAlbums.find(p => p.id === album.parentId)?.name || '알 수 없음'}
                                            </span>
                                        )}

                                        <Folder size={40} className="text-indigo-200 group-hover:text-indigo-400 transition-colors" />
                                        <span className="font-bold text-[var(--text-primary)] truncate max-w-full text-center">{album.name}</span>
                                        <span className="text-[10px] text-[var(--text-secondary)]">{getSubAlbumStats(album.id)}</span>
                                    </div>
                                </DroppableFolder>
                            ))}
                        </div>
                    </div>
                )}

                {/* 글 목록 - Draggable */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">기록들 ({posts.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {posts.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            {subAlbums.length > 0 ? "폴더를 선택하거나 기록을 남겨보세요." : "이 폴더에는 아직 글이 없습니다."}
                        </div>
                    ) : (
                        posts.map(p => (
                            <DraggablePost key={p.id} id={p.id}>
                                <div onClick={() => onPostClick(p)} className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md cursor-pointer transition transform hover:-translate-y-1 relative group h-full">
                                    <div className="text-4xl mb-4">📜</div>

                                    {/* ✨ Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('정말 삭제하시겠습니까?')) {
                                                onDeletePost(p.id);
                                            }
                                        }}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    {/* ✨ Favorite Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleFavorite(p.id);
                                        }}
                                        className={`absolute top-4 ${p.isFavorite ? 'right-12 opacity-100' : 'right-12 opacity-0 group-hover:opacity-100'} p-2 rounded-full transition-all ${p.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'} cursor-pointer`}
                                        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
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
                            </DraggablePost>
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
        </DndContext>
    );
};

export default PostFolderPage;
