import React, { useState } from 'react';
import Navigation from '../../components/Header/Navigation';
import { usePostEditor } from './hooks/usePostEditor';
import PostListPage from './pages/PostListPage';
import PostViewPage from './pages/PostViewPage';
import PostEditorPage from './pages/PostEditorPage';
import PostCreatePage from './pages/PostCreatePage';

import PostAlbumPage from './pages/PostAlbumPage';
import PostFolderPage from './pages/PostFolderPage';
import CreateAlbumModal from './components/CreateAlbumModal';

const Post: React.FC = () => {
    // Custom Hook 사용
    const editor = usePostEditor();
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false); // 앨범 생성 모달 상태

    // 이미지 업로드 핸들러 (Hook -> Component 전달용)
    const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            Promise.all(files.map(f => new Promise<string>(r => {
                const rd = new FileReader(); rd.onloadend = () => r(rd.result as string); rd.readAsDataURL(f);
            }))).then(u => editor.setTempImages(p => [...p, ...u]));
        }
    };

    // 폴더 뷰를 위한 필터링 로직
    const filteredPosts = editor.selectedAlbumTag === null
        ? editor.posts.filter(p => !p.tags || p.tags.length === 0)
        : editor.posts.filter(p => p.tags?.includes(editor.selectedAlbumTag!));

    return (
        <div className="min-h-screen pb-32">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* 상단 헤더 버튼 (리스트/앨범/폴더 뷰일 때만 표시) */}
                {/* 1) 앨범 뷰 (기본) */}
                {editor.viewMode === 'album' && (
                    <PostAlbumPage
                        posts={editor.posts}
                        customAlbums={editor.customAlbums}
                        onAlbumClick={editor.handleAlbumClick}
                        onCreateAlbum={() => setIsAlbumModalOpen(true)}
                        onStartWriting={editor.handleStartWriting}
                        onRenameAlbum={editor.handleRenameAlbum}
                        onDeleteAlbum={editor.handleDeleteAlbum}
                    />
                )}

                {/* 2) 폴더 뷰 (앨범 상세) */}
                {editor.viewMode === 'folder' && (
                    <PostFolderPage
                        tagName={editor.selectedAlbumTag}
                        posts={filteredPosts}
                        onBack={() => editor.setViewMode('album')}
                        onPostClick={editor.handlePostClick}
                        onStartWriting={editor.handleStartWriting}
                    />
                )}

                {/* 3) 리스트 뷰 (전체 보기용 - 필요 시 사용) */}
                {editor.viewMode === 'list' && (
                    <PostListPage
                        posts={editor.posts}
                        onStartWriting={editor.handleStartWriting}
                        onPostClick={editor.handlePostClick}
                    />
                )}

                {/* 4) 읽기 모드 */}
                {editor.viewMode === 'read' && (
                    <PostViewPage editor={editor} />
                )}

                {/* 5) 작성(Create) 모드 */}
                {editor.viewMode === 'editor' && !editor.currentPostId && (
                    <PostCreatePage editor={editor} handleImagesUpload={handleImagesUpload} />
                )}

                {/* 6) 수정(Edit) 모드 */}
                {editor.viewMode === 'editor' && editor.currentPostId && (
                    <PostEditorPage editor={editor} handleImagesUpload={handleImagesUpload} />
                )}
            </div>

            {/* 앨범 생성 모달 */}
            <CreateAlbumModal
                isOpen={isAlbumModalOpen}
                onClose={() => setIsAlbumModalOpen(false)}
                onSave={(name, tags, coverConfig) => {
                    editor.handleCreateAlbum(name, tags);

                    if (coverConfig) {
                        try {
                            const stored = localStorage.getItem('album_covers_v1');
                            const covers = stored ? JSON.parse(stored) : {};
                            covers[name] = coverConfig;
                            localStorage.setItem('album_covers_v1', JSON.stringify(covers));

                            // Notify PostAlbumPage
                            window.dispatchEvent(new Event('album_cover_update'));
                        } catch (e) {
                            console.error("Failed to save album cover", e);
                        }
                    }

                    setIsAlbumModalOpen(false);
                }}
            />
        </div>
    );
};

export default Post;