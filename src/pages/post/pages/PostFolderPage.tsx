// ✨ Import customAlbum for props
import React, { useState } from 'react';
import CreateFolderModal from '../components/CreateFolderModal';
import type { PostData } from '../types';
import { ArrowLeft, Home, Folder, PenLine } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';

interface Props {
    albumName: string | null;
    albumId: string | null;
    posts: PostData[];
    onBack: () => void;
    onPostClick: (post: PostData) => void;
    onStartWriting: (initialAlbumId?: string) => void;
    onCreateAlbum: (name: string, tags: string[], parentId?: string | null) => void; // Update signature
    // ✨ New Prop for looking up sub-albums
    customAlbums: any[];
    onAlbumClick: (id: string | null) => void;
}

const PostFolderPage: React.FC<Props> = ({ albumName, albumId, posts, onBack, onPostClick, onStartWriting, onCreateAlbum, customAlbums, onAlbumClick }) => {
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // ✨ Filter sub-folders
    const subAlbums = customAlbums.filter(a => a.parentId === albumId);

    const handleCreateFolder = (name: string) => {
        onCreateAlbum(name, [], albumId); // Create with parentId
    };

    return (
        <div>
            {/* 상단 네비게이션 (Breadcrumb) */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center text-sm">
                        <PostBreadcrumb items={[
                            { label: '내 앨범', icon: Home, onClick: onBack },
                            // TODO: If we have deep nesting, we might need a recursive breadcrumb lookup.
                            // For now, parent -> current.
                            // Ideally, `usePostEditor` should provide the "path" to the current album.
                            { label: `${albumName || '기타 보관함'}`, icon: Folder }
                        ]} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                                className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center gap-2 group"
                            >
                                <Folder size={40} className="text-indigo-200 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-bold text-[var(--text-primary)] truncate max-w-full text-center">{album.name}</span>
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
                        이 폴더에는 아직 글이 없습니다.
                    </div>
                ) : (
                    posts.map(p => (
                        <div key={p.id} onClick={() => onPostClick(p)} className="bg-[var(--bg-card)] p-6 rounded-xl shadow-sm border border-[var(--border-color)] hover:shadow-md cursor-pointer transition transform hover:-translate-y-1">
                            <div className="text-4xl mb-4">📜</div>
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
