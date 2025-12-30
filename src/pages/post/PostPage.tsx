import React from 'react';
import Navigation from '../../components/Header/Navigation';
import { usePostEditor } from './hooks/usePostEditor';
import PostListPage from './pages/PostListPage';
import PostViewPage from './pages/PostViewPage';
import PostEditorPage from './pages/PostEditorPage';
import PostCreatePage from './pages/PostCreatePage';

const Post: React.FC = () => {
    // Custom Hook 사용
    const editor = usePostEditor();

    // 이미지 업로드 핸들러 (Hook -> Component 전달용)
    const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            Promise.all(files.map(f => new Promise<string>(r => {
                const rd = new FileReader(); rd.onloadend = () => r(rd.result as string); rd.readAsDataURL(f);
            }))).then(u => editor.setTempImages(p => [...p, ...u]));
        }
    };

    return (
        <div className="min-h-screen pb-32">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* 1) 리스트 뷰 */}
                {editor.viewMode === 'list' && (
                    <PostListPage
                        posts={editor.posts}
                        onStartWriting={editor.handleStartWriting}
                        onPostClick={editor.handlePostClick}
                    />
                )}

                {/* 2) 읽기 모드 */}
                {editor.viewMode === 'read' && (
                    <PostViewPage editor={editor} />
                )}

                {/* 3) 작성(Create) 모드: editor 모드이면서 currentPostId가 없을 때 */}
                {editor.viewMode === 'editor' && !editor.currentPostId && (
                    <PostCreatePage editor={editor} handleImagesUpload={handleImagesUpload} />
                )}

                {/* 4) 수정(Edit) 모드: editor 모드이면서 currentPostId가 있을 때 */}
                {editor.viewMode === 'editor' && editor.currentPostId && (
                    <PostEditorPage editor={editor} handleImagesUpload={handleImagesUpload} />
                )}
            </div>
        </div>
    );
};

export default Post;