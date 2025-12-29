import React from 'react';
import Navigation from '../../components/Header/Navigation';
// ❌ EditorToolbar import 삭제 (Canvas 안에서 처리함)
import { usePostEditor } from './hooks/usePostEditor';

// 분리된 컴포넌트 임포트
import PostList from './components/PostList';
import EditorCanvas from './components/EditorCanvas';
import EditorSidebar from './components/EditorSidebar';

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
                    <PostList
                        posts={editor.posts}
                        onStartWriting={editor.handleStartWriting}
                        onPostClick={editor.handlePostClick}
                    />
                )}

                {/* 2) 에디터 및 읽기 모드 */}
                {(editor.viewMode === 'editor' || editor.viewMode === 'read') && (
                    <div className="flex h-auto min-h-[85vh] gap-6 relative">
                        {/* 메인 캔버스 */}
                        <EditorCanvas
                            title={editor.title} setTitle={editor.setTitle}
                            titleStyles={editor.titleStyles}
                            viewMode={editor.viewMode} setViewMode={editor.setViewMode as any}
                            blocks={editor.blocks} setBlocks={editor.setBlocks}
                            stickers={editor.stickers} floatingTexts={editor.floatingTexts}
                            floatingImages={editor.floatingImages}
                            selectedId={editor.selectedId}

                            // 🔴 [중요] Hook에서 가져온 타입 정보를 Canvas에 전달
                            selectedType={editor.selectedType}

                            onSelect={(id, type) => {
                                editor.setSelectedId(id);
                                editor.setSelectedType(type);
                            }}
                            onUpdate={editor.handleUpdate}
                            onDelete={editor.handleDelete}
                            onBlockImageUpload={editor.handleBlockImageUpload}
                            onBackgroundClick={() => {
                                if (editor.viewMode === 'editor') {
                                    editor.setSelectedId(null);
                                    editor.setSelectedType(null);
                                }
                            }}
                        />

                        {/* 오른쪽 사이드바 (에디터 모드일 때만) */}
                        {editor.viewMode === 'editor' && (
                            <EditorSidebar
                                isSaving={editor.isSaving} onSave={editor.handleSave} onCancel={() => editor.setViewMode('list')}
                                onAddBlock={() => editor.setBlocks([...editor.blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                                onAddFloatingText={editor.addFloatingText}
                                onAddSticker={editor.addSticker}
                                onAddFloatingImage={editor.addFloatingImage}
                                rawInput={editor.rawInput} setRawInput={editor.setRawInput}
                                selectedLayoutId={editor.selectedLayoutId} setSelectedLayoutId={editor.setSelectedLayoutId}
                                tempImages={editor.tempImages} setTempImages={editor.setTempImages}
                                fileInputRef={editor.fileInputRef as React.RefObject<HTMLInputElement>} handleImagesUpload={handleImagesUpload}
                                onAiGenerate={editor.handleAiGenerate} isAiProcessing={editor.isAiProcessing}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* ❌ [삭제됨] 여기에 있던 <EditorToolbar ... /> 코드를 지웠습니다.
                이유: EditorCanvas 안에서 이미 툴바를 보여주고 있기 때문에 중복/오류의 원인이었습니다.
            */}
        </div>
    );
};

export default Post;