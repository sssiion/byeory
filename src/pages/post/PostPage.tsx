import React, { useState } from 'react';
import Navigation from '../../components/header/Navigation';
import { usePostEditor } from '../../components/post/hooks/usePostEditor';

import PostReadView from '../../components/post/views/PostReadView';
import PostEditorView from '../../components/post/views/PostEditorView';
import PostCreateView from '../../components/post/views/PostCreateView';

import PostAlbumView from '../../components/post/views/PostAlbumView';
import PostFolderView from '../../components/post/views/PostFolderView';
import CreateAlbumModal from '../../components/post/components/CreateAlbumModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useIsMobile } from '../../hooks'; // ✨
import FloatingSettingsPanel from '../../components/dashboard/components/FloatingSettingsPanel'; // ✨

const Post: React.FC = () => {
    // Custom Hook 사용
    const editor = usePostEditor();
    const isMobile = useIsMobile(); // ✨
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

    React.useEffect(() => {
        if (editor.viewMode === 'album' || editor.viewMode === 'folder') {
            editor.refreshPosts();
        }
    }, [editor.viewMode]);

    React.useEffect(() => {
        const handlePostTabClick = () => {
            if (editor.viewMode === 'editor') {
                if (editor.isDirty) {
                    editor.showConfirmModal(
                        "이동 확인",
                        "작성 중인 내용이 저장되지 않을 수 있습니다.\n포스트 홈으로 이동하시겠습니까?",
                        "danger",
                        () => {
                            editor.setViewMode('album');
                            editor.closeConfirmModal();
                        }
                    );
                } else {
                    editor.setViewMode('album');
                }
            } else if (editor.viewMode !== 'album') {
                editor.setViewMode('album');
            }
        };

        window.addEventListener('post-tab-click', handlePostTabClick);
        return () => window.removeEventListener('post-tab-click', handlePostTabClick);
    }, [editor.viewMode, editor.setViewMode, editor.isDirty, editor.showConfirmModal]);

    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (editor.viewMode === 'editor' && editor.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [editor.viewMode, editor.isDirty]);

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
            if (editor.selectedAlbumId === '__all__') return true;

            if (p.albumIds?.includes(editor.selectedAlbumId!)) return true;
            if (!p.albumIds || p.albumIds.length === 0) {
                const targetAlbum = editor.customAlbums.find(a => a.id === editor.selectedAlbumId);
                if (targetAlbum?.tag && p.tags?.includes(targetAlbum.tag)) return true;
            }
            return false;
        });

    return (
        <div className="min-h-screen pb-32">
            <Navigation />

            {/* ✨ Floating Settings Panel */}
            <FloatingSettingsPanel
                defaultOpen={false}
                isMobile={isMobile}
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* ... existing jsx ... */}
                {/* 상단 헤더 버튼 (리스트/앨범/폴더 뷰일 때만 표시) */}
                {/* 1) 앨범 뷰 (기본) */}
                {editor.viewMode === 'album' && (
                    <PostAlbumView
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
                        showConfirmModal={editor.showConfirmModal}
                    />
                )}

                {/* 2) 폴더 뷰 (앨범 상세) */}
                {editor.viewMode === 'folder' && (
                    <PostFolderView
                        albumId={editor.selectedAlbumId}
                        posts={filteredPosts}
                        allPosts={editor.posts}
                        onPostClick={editor.handlePostClick}
                        onStartWriting={editor.handleStartWriting}
                        onCreateAlbum={(name, tags, parentId) => editor.handleCreateAlbum(name, tags, parentId || undefined)}
                        customAlbums={editor.customAlbums}
                        onAlbumClick={editor.handleAlbumClick}
                        onDeletePost={(id) => editor.handleDeletePost(Number(id))}
                        onDeleteAlbum={editor.handleDeleteAlbum}
                        onToggleFavorite={(id) => {
                            const post = editor.posts.find(p => p.id === id);
                            if (post) editor.handleToggleFavorite(post);
                        }}
                        onMovePost={() => { }}
                        onRefresh={editor.refreshPosts}
                        showConfirmModal={editor.showConfirmModal}
                    />
                )}

                {/* 3) 리스트 뷰
                {editor.viewMode === 'list' && (
                    <PostListPage
                        posts={editor.posts}
                        onStartWriting={editor.handleStartWriting}
                        onPostClick={editor.handlePostClick}
                    />
                )} */}

                {/* 4) 읽기 모드 */}
                {editor.viewMode === 'read' && (
                    <PostReadView editor={editor} />
                )}

                {/* 5) 작성(Create) 모드 */}
                {editor.viewMode === 'editor' && !editor.currentPostId && (
                    <PostCreateView editor={editor} handleImagesUpload={handleImagesUpload} />
                )}

                {/* 6) 수정(Edit) 모드 */}
                {editor.viewMode === 'editor' && editor.currentPostId && (
                    <PostEditorView editor={editor} handleImagesUpload={handleImagesUpload} />
                )}
            </div>

            {/* 앨범 생성 모달 */}
            <CreateAlbumModal
                isOpen={isAlbumModalOpen}
                onClose={() => setIsAlbumModalOpen(false)}
                albums={editor.customAlbums}
                showConfirmModal={editor.showConfirmModal}
                onSave={(name, tag, parentId, type, roomConfig, coverConfig) => {
                    const tags = tag ? [tag] : [];
                    const pId = parentId || undefined;

                    editor.handleCreateAlbum(name, tags, pId, type, roomConfig, coverConfig);
                    setIsAlbumModalOpen(false);
                }}
            />

            <ConfirmationModal
                isOpen={editor.confirmModal.isOpen}
                title={editor.confirmModal.title}
                message={editor.confirmModal.message}
                type={editor.confirmModal.type}
                singleButton={editor.confirmModal.singleButton}
                onConfirm={() => {
                    editor.confirmModal.onConfirm();
                }}
                onCancel={editor.closeConfirmModal}
            />
        </div>
    );
};

export default Post;