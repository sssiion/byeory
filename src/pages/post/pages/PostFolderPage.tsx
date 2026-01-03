// ✨ Import customAlbum for props
import React, { useState, useEffect } from 'react';
import CreateFolderModal from '../components/CreateFolderModal';
import type { PostData } from '../types';
import { ArrowLeft, Folder, PenLine, Trash2, X } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, useSensors, useSensor, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PostThumbnail from '../components/PostThumbnail';

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
    onRefresh?: () => void; // ✨ Data Refresh Trigger
}

const PostFolderPage: React.FC<Props> = ({ albumId, allPosts, onPostClick, onStartWriting, onCreateAlbum, customAlbums, onAlbumClick, onDeletePost, onDeleteAlbum, onToggleFavorite, onRefresh }) => {
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // ✨ Local State for API Data
    const [contents, setContents] = useState<{ type: 'POST' | 'FOLDER', data: any }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // For "Add Existing"

    // ✨ Fetch Contents
    const loadContents = async () => {
        if (albumId) {
            // Loading state only if no data (initial load) to prevent flicker on update
            if (contents.length === 0) setIsLoading(true);
            try {
                // Import dynamically or assume it's imported at top (I'll add import line)
                const data = await import('../api').then(m => m.fetchAlbumContents(albumId, allPosts, customAlbums));
                setContents(data as any);
            } catch (e) {
                console.error("Failed to load album contents", e);
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        loadContents();
    }, [albumId, allPosts, customAlbums /* ✨ Added customAlbums to trigger refresh on folder creation */]);

    // ✨ Derived Lists from Local Content
    const folders = contents.filter(c => c.type === 'FOLDER').map(c => c.data);
    const localPosts = contents.filter(c => c.type === 'POST').map(c => c.data as PostData);

    // ✨ Use Breadcrumb Hook
    const breadcrumbItems = useBreadcrumbs(albumId, customAlbums, onAlbumClick);

    // ✨ Item Management Handlers
    const handleManageItem = async (action: 'ADD' | 'REMOVE', type: 'POST' | 'FOLDER', id: string | number) => {
        if (!albumId) return;
        const api = await import('../api');
        await api.manageAlbumItem(albumId, action, type, id);
        // loadContents(); // ✨ Removed: useEffect will trigger via allPosts change if onRefresh works
        onRefresh?.();
    };

    const handleCreateFolder = (name: string) => {
        return onCreateAlbum(name, [], albumId);
    };

    // ✨ Handle Drag End (Local Implementation via API)
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const targetFolderId = String(over.id);
        const isActivePost = localPosts.some(p => String(p.id) === String(active.id));

        // Move Post to Folder
        if (isActivePost) {
            const api = await import('../api');
            await api.manageAlbumItem(targetFolderId, 'ADD', 'POST', active.id);
            if (albumId && albumId !== '__all__' && albumId !== '__others__') {
                await api.manageAlbumItem(albumId, 'REMOVE', 'POST', active.id);
            }
            onRefresh?.();
        }
    };

    // ✨ DnD Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // ✨ Picker State
    const [selectedPickerIds, setSelectedPickerIds] = useState<string[]>([]);
    const pickerCandidates = allPosts.filter(p => !localPosts.some(lp => lp.id === p.id)); // Exclude already in album

    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
            <div>
                {/* Navigation & Header */}
                <div className="flex items-center justify-between mb-8 relative z-50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const parent = customAlbums.find(a => a.id === albumId)?.parentId;
                                onAlbumClick(parent || null);
                            }}
                            className="p-3 hover:bg-[var(--bg-card-secondary)] rounded-full transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center text-lg font-medium">
                            <PostBreadcrumb items={breadcrumbItems} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* ✨ Add Existing Item Button */}
                        {albumId && albumId !== '__all__' && albumId !== '__others__' && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-4 h-12 text-base font-bold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-colors"
                            >
                                <Folder size={18} />
                                항목 추가
                            </button>
                        )}

                        {albumId !== '__all__' && !customAlbums.find(a => a.id === albumId)?.parentId && (
                            <button
                                onClick={() => setIsCreateFolderOpen(true)}
                                className="flex items-center gap-2 px-4 h-12 text-base font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-transparent hover:border-indigo-200"
                            >
                                <Folder size={18} />
                                폴더 추가
                            </button>
                        )}

                        {albumId && albumId !== '__all__' && (
                            <button
                                onClick={() => onStartWriting(albumId)}
                                className="flex items-center gap-2 px-6 h-12 rounded-xl bg-[var(--btn-bg)] text-[var(--btn-text)] font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 text-base"
                            >
                                <PenLine size={20} />
                                기록 남기기
                            </button>
                        )}
                    </div>
                </div>


                {/* Folders Display */}
                {folders.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <Folder size={20} className="text-yellow-500" />
                            폴더
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {folders.map((album: any) => (
                                <DroppableFolder key={album.id} id={album.id}>
                                    <div
                                        onClick={() => onAlbumClick(album.id)}
                                        className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center gap-2 group relative h-full"
                                    >
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
                                        {/* Stats approximation */}
                                        <span className="text-[10px] text-[var(--text-secondary)]">
                                            폴더
                                        </span>
                                    </div>
                                </DroppableFolder>
                            ))}
                        </div>
                    </div>
                )}

                {/* Posts Display */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">기록들 ({localPosts.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {localPosts.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            {isLoading ? "로딩 중..." : "이 폴더에는 아직 글이 없습니다."}
                        </div>
                    ) : (
                        localPosts.map(p => (
                            <DraggablePost key={p.id} id={p.id}>
                                <div onClick={() => onPostClick(p)} className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md cursor-pointer transition transform hover:-translate-y-1 relative group h-80 flex flex-col overflow-hidden">
                                    {/* 1. Top - Thumbnail (60%) */}
                                    <div className="h-[60%] w-full bg-white relative overflow-hidden">
                                        <PostThumbnail post={p} width={400} height={320} />

                                        {/* Overlay Gradient for depth */}
                                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                                    </div>

                                    {/* 2. Bottom - Info (40%) */}
                                    <div className="h-[40%] p-5 flex flex-col justify-between bg-[var(--bg-card)]">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-[var(--text-primary)] text-lg line-clamp-1 leading-tight">{p.title}</h4>

                                            {/* Hashtags */}
                                            <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                                                {p.tags && p.tags.length > 0 ? (
                                                    p.tags.map((t: string) => (
                                                        <span key={t} className="text-[11px] font-medium text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-md truncate">#{t}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-[var(--text-secondary)] opacity-50">태그 없음</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer: Actions & Date */}
                                        <div className="flex items-end justify-between mt-2 pt-2 border-t border-[var(--border-color)]/50">
                                            <span className="text-[11px] font-medium text-[var(--text-secondary)] tracking-tight">
                                                {p.date}
                                            </span>

                                            <div className="flex gap-1" onPointerDown={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleFavorite(p.id);
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-all ${p.isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] hover:text-[var(--text-primary)]'}`}
                                                    title="즐겨찾기"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={p.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                                </button>

                                                {(albumId === '__all__' || albumId === '__others__') ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm("정말 이 기록을 영구 삭제하시겠습니까?")) {
                                                                onDeletePost(p.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="영구 삭제"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm("이 앨범에서 제거하시겠습니까?")) {
                                                                handleManageItem('REMOVE', 'POST', p.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="앨범에서 제거"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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

                {/* ✨ Picker Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-[var(--bg-modal)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-[var(--border-color)] backdrop-blur-md">
                            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
                                <h3 className="font-bold text-lg text-[var(--text-primary)]">게시물 추가하기</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-[var(--bg-card-secondary)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={24} /></button>
                            </div>
                            <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
                                {pickerCandidates.length === 0 ? <div className="text-center py-10 text-[var(--text-tertiary)]">추가할 수 있는 기록이 없습니다.</div> :
                                    pickerCandidates.map(p => (
                                        <div key={p.id}
                                            onClick={() => {
                                                if (selectedPickerIds.includes(String(p.id))) setSelectedPickerIds(prev => prev.filter(id => id !== String(p.id)));
                                                else setSelectedPickerIds(prev => [...prev, String(p.id)]);
                                            }}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedPickerIds.includes(String(p.id)) ? 'border-indigo-500 bg-indigo-50/10' : 'border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPickerIds.includes(String(p.id)) ? 'bg-indigo-500 border-indigo-500' : 'border-[var(--border-color)] bg-[var(--bg-card-secondary)]'}`}>
                                                {selectedPickerIds.includes(String(p.id)) && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-[var(--text-primary)]">{p.title}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">{p.date}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2">
                                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] rounded-lg transition-colors">취소</button>
                                <button
                                    onClick={async () => {
                                        for (const id of selectedPickerIds) {
                                            await handleManageItem('ADD', 'POST', id);
                                        }
                                        setSelectedPickerIds([]);
                                        setIsAddModalOpen(false);
                                    }}
                                    disabled={selectedPickerIds.length === 0}
                                    className="px-6 py-2 text-sm font-bold bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
                                >
                                    {selectedPickerIds.length}개 추가
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndContext>
    );
};

export default PostFolderPage;
