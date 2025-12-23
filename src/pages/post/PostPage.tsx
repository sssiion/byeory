import React from 'react';
import Navigation from '../../components/Header/Navigation';
import EditorToolbar from './components/EditorToolbar';
import  { usePostEditor } from './hooks/usePostEditor';

// 분리된 컴포넌트 임포트
import PostList from './components/PostList';
import EditorCanvas from './components/EditorCanvas';
import EditorSidebar from './components/EditorSidebar';

const Post: React.FC = () => {
    // Custom Hook 사용 (모든 상태와 함수를 여기서 가져옴)
    const editor = usePostEditor();

    // 현재 선택된 아이템의 스타일/속성 값 가져오기 (Toolbar용 helper)
    const getSelectedValues = () => {
        if (!editor.selectedId) return {};

        if (editor.selectedType === 'block') {
            return editor.blocks.find(b => b.id === editor.selectedId)?.styles || {};
        }
        if (editor.selectedType === 'sticker') {
            return editor.stickers.find(s => s.id === editor.selectedId) || {};
        }
        if (editor.selectedType === 'floating') {
            const item = editor.floatingTexts.find(f => f.id === editor.selectedId);
            return item ? { ...item.styles, zIndex: item.zIndex } : {};
        }
        // ✨ [수정 1] 자유 사진(floatingImage) 선택 시 속성 반환 추가
        if (editor.selectedType === 'floatingImage') {
            return editor.floatingImages.find(i => i.id === editor.selectedId) || {};
        }
        return {};
    };

    // 선택된 블록이 이미지를 가지고 있는지 확인 (크기 조절 슬라이더용)
    const checkHasImage = () => {
        if (editor.selectedType === 'block' && editor.selectedId) {
            const block = editor.blocks.find(b => b.id === editor.selectedId);
            // type에 'image'가 포함되어 있으면 이미지가 있는 블록으로 간주
            return block ? block.type.includes('image') : false;
        }
        return false;
    };

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
        <div className="min-h-screen bg-gray-50 pb-32">
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
                            viewMode={editor.viewMode} setViewMode={editor.setViewMode as any}
                            blocks={editor.blocks} setBlocks={editor.setBlocks}
                            stickers={editor.stickers} floatingTexts={editor.floatingTexts}
                            floatingImages={editor.floatingImages} // ✨ 연결 완료
                            selectedId={editor.selectedId}
                            onSelect={(id, type) => { editor.setSelectedId(id); editor.setSelectedType(type); }}
                            onUpdate={editor.handleUpdate}
                            onDelete={editor.handleDelete}
                            onBlockImageUpload={editor.handleBlockImageUpload}
                            onBackgroundClick={() => { if(editor.viewMode==='editor') { editor.setSelectedId(null); editor.setSelectedType(null); }}}
                            // ✨ [수정 2] Canvas에는 onAddFloatingImage 전달 불필요 (삭제함)
                        />

                        {/* 오른쪽 사이드바 (에디터 모드일 때만) */}
                        {editor.viewMode === 'editor' && (
                            <EditorSidebar
                                isSaving={editor.isSaving} onSave={editor.handleSave} onCancel={() => editor.setViewMode('list')}
                                onAddBlock={() => editor.setBlocks([...editor.blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                                onAddFloatingText={editor.addFloatingText}
                                onAddSticker={editor.addSticker}
                                onAddFloatingImage={editor.addFloatingImage} // Sidebar에는 꼭 필요!
                                rawInput={editor.rawInput} setRawInput={editor.setRawInput}
                                selectedLayoutId={editor.selectedLayoutId} setSelectedLayoutId={editor.setSelectedLayoutId}
                                tempImages={editor.tempImages} setTempImages={editor.setTempImages}
                                fileInputRef={editor.fileInputRef} handleImagesUpload={handleImagesUpload}
                                onAiGenerate={editor.handleAiGenerate} isAiProcessing={editor.isAiProcessing}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* 하단 플로팅 툴바 (선택 시 등장) */}
            {editor.selectedId && editor.viewMode === 'editor' && (
                <EditorToolbar
                    targetType={editor.selectedType}
                    values={getSelectedValues()}
                    onUpdate={(k, v) => editor.handleUpdate(editor.selectedId!, editor.selectedType!, k, v)}
                    onZIndexChange={editor.changeZIndex}
                    onDelete={editor.handleDelete}
                    hasImage={checkHasImage()}
                />
            )}
        </div>
    );
};

export default Post;