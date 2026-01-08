import React, { useState } from 'react';
import Navigation from '../../components/Header/Navigation';
import { usePostEditor } from './hooks/usePostEditor';

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

    // ✨ View Changed -> Auto Refresh Data (Counts, Post Lists)
    React.useEffect(() => {
        if (editor.viewMode === 'album' || editor.viewMode === 'folder') {
            editor.refreshPosts();
        }
    }, [editor.viewMode]);

    // ✨ Listen for Post Tab Click (Navigation)
    React.useEffect(() => {
        const handlePostTabClick = () => {
            if (editor.viewMode === 'editor') {
                if (window.confirm("작성 중인 내용이 저장되지 않을 수 있습니다. 포스트 홈으로 이동하시겠습니까?")) {
                    editor.setViewMode('album');
                }
            } else if (editor.viewMode !== 'album') {
                editor.setViewMode('album');
            }
        };

        window.addEventListener('post-tab-click', handlePostTabClick);
        return () => window.removeEventListener('post-tab-click', handlePostTabClick);
    }, [editor.viewMode, editor.setViewMode]);

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
    const filteredPosts = (editor.selectedAlbumId === null || editor.selectedAlbumId === '__others__')
        ? editor.posts.filter(p => !p.albumIds || p.albumIds.length === 0)
        : editor.posts.filter(p => {
            // ✨ All Records view: Show ALL posts
            if (editor.selectedAlbumId === '__all__') return true;

            // Priority: ID match
            if (p.albumIds?.includes(editor.selectedAlbumId!)) return true;
            // Fallback: Legacy Tag match (only if no IDs present on post)
            if (!p.albumIds || p.albumIds.length === 0) {
                const targetAlbum = editor.customAlbums.find(a => a.id === editor.selectedAlbumId);
                if (targetAlbum?.tag && p.tags?.includes(targetAlbum.tag)) return true;
            }
            return false;
        });

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
                        onUpdateAlbum={editor.handleUpdateAlbum}
                        onDeleteAlbum={editor.handleDeleteAlbum}
                        sortOption={editor.sortOption}
                        setSortOption={editor.setSortOption}
                        onPostClick={editor.handlePostClick}
                        onToggleFavorite={(id) => {
                            const post = editor.posts.find(p => p.id === id);
                            if (post) editor.handleToggleFavorite(post);
                        }}
                        handleToggleAlbumFavorite={(id) => {
                            const album = editor.customAlbums.find(a => a.id === id);
                            if (album) editor.handleToggleAlbumFavorite(album);
                        }}
                    />
                )}

                {/* 2) 폴더 뷰 (앨범 상세) */}
                {editor.viewMode === 'folder' && (
                    <PostFolderPage
                        albumId={editor.selectedAlbumId}
                        posts={filteredPosts}
                        allPosts={editor.posts}
                        onPostClick={editor.handlePostClick}
                        onStartWriting={editor.handleStartWriting}
                        onCreateAlbum={(name, tags, parentId) => editor.handleCreateAlbum(name, tags, parentId)}
                        customAlbums={editor.customAlbums}
                        onAlbumClick={editor.handleAlbumClick}
                        onDeletePost={(id) => editor.handleDeletePost(Number(id))}
                        onDeleteAlbum={editor.handleDeleteAlbum}
                        onToggleFavorite={(id) => {
                            const post = editor.posts.find(p => p.id === id);
                            if (post) editor.handleToggleFavorite(post);
                        }}
                        onMovePost={undefined} // Disabled for now as hook doesn't support it
                        onRefresh={editor.refreshPosts}
                    />
                )}

                {/* 3) 리스트 뷰 (전체 보기용 - 필요 시 사용)
                {editor.viewMode === 'list' && (
                    <PostListPage
                        posts={editor.posts}
                        onStartWriting={editor.handleStartWriting}
                        onPostClick={editor.handlePostClick}
                    />
                )} */}

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
            {/* 앨범 생성 모달 */}
            <CreateAlbumModal
                isOpen={isAlbumModalOpen}
                onClose={() => setIsAlbumModalOpen(false)}
                albums={editor.customAlbums}
                onSave={(name, tag, parentId, type, roomConfig, coverConfig) => {
                    // Convert single tag to array for the hook
                    const tags = tag ? [tag] : [];
                    // Ensure parentId is string or undefined (modal gives string | null)
                    const pId = parentId || undefined;

                    editor.handleCreateAlbum(name, tags, pId, type, roomConfig, coverConfig);
                    setIsAlbumModalOpen(false);
                }}
            />
        </div>
    );
};

export default Post;