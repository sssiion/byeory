import React from 'react';
import EditorCanvas from '../components/editor/EditorCanvas';
import EditorSidebar from '../components/editor/EditorSidebar';
import { usePostEditor } from '../hooks/usePostEditor';

import SavePostModal from '../components/SavePostModal';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PostCreatePage: React.FC<Props> = ({ editor, handleImagesUpload }) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);

    const handleConfirmSave = async () => {
        await editor.handleSave(); // 실제 저장 로직
        setIsSaveModalOpen(false);
    };

    return (
        <div className="flex h-auto min-h-[85vh] gap-6 relative">
            {/* 메인 캔버스 */}
            <EditorCanvas
                title={editor.title} setTitle={editor.setTitle}
                titleStyles={editor.titleStyles}
                viewMode={'editor'}
                blocks={editor.blocks} setBlocks={editor.setBlocks}
                stickers={editor.stickers} floatingTexts={editor.floatingTexts}
                floatingImages={editor.floatingImages}
                selectedId={editor.selectedId}
                selectedType={editor.selectedType}
                onSelect={(id, type) => {
                    editor.setSelectedId(id);
                    editor.setSelectedType(type);
                }}
                onUpdate={editor.handleUpdate}
                onDelete={editor.handleDelete}
                onBlockImageUpload={editor.handleBlockImageUpload}
                onBackgroundClick={() => {
                    editor.setSelectedId(null);
                    editor.setSelectedType(null);
                }}
                visibility={editor.visibility}
                setVisibility={editor.setVisibility}
            />

            {/* 오른쪽 사이드바 */}
            <EditorSidebar
                isSaving={editor.isSaving}
                onSave={() => {
                    // ✨ Validation: Check Title & Content
                    if (!editor.title.trim()) {
                        return alert("제목을 입력해주세요!");
                    }
                    const hasContent = editor.blocks.some(b => b.text?.trim() || b.imageUrl || b.imageUrl2) ||
                        editor.stickers.length > 0 ||
                        editor.floatingTexts.length > 0 ||
                        editor.floatingImages.length > 0;

                    if (!hasContent) {
                        return alert("내용을 입력해주세요!");
                    }

                    setIsSaveModalOpen(true);
                }}
                onCancel={() => editor.setViewMode('album')}
                onAddBlock={() => editor.setBlocks([...editor.blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                onAddFloatingText={editor.addFloatingText}
                onAddSticker={editor.addSticker}
                onAddFloatingImage={editor.addFloatingImage}
                rawInput={editor.rawInput} setRawInput={editor.setRawInput}
                selectedLayoutId={editor.selectedLayoutId} setSelectedLayoutId={editor.setSelectedLayoutId}
                tempImages={editor.tempImages} setTempImages={editor.setTempImages}
                fileInputRef={editor.fileInputRef as React.RefObject<HTMLInputElement>} handleImagesUpload={handleImagesUpload}
                onAiGenerate={editor.handleAiGenerate} isAiProcessing={editor.isAiProcessing}
                currentTags={editor.currentTags}
                onTagsChange={editor.setTags}
            />

            {/* ✨ 저장 위치 선택 모달 */}
            <SavePostModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                currentTags={editor.currentTags}
                onTagsChange={editor.setTags}
                customAlbums={editor.customAlbums}
                isSaving={editor.isSaving}
                selectedAlbumIds={editor.targetAlbumIds}
                onAlbumIdsChange={editor.setTargetAlbumIds}
                onCreateAlbum={editor.handleCreateAlbum}
                onDeleteAlbum={editor.handleDeleteAlbum}
                posts={editor.posts}
                mode={editor.mode}
                setMode={editor.setMode}
                isFavorite={editor.isFavorite}
                setIsFavorite={editor.setIsFavorite}
            />
        </div>
    );
};

export default PostCreatePage;
