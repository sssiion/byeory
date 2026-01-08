import React from 'react';
import EditorCanvas from '../components/editor/EditorCanvas';
import EditorSidebar from '../components/editor/EditorSidebar';
import { usePostEditor } from '../hooks/usePostEditor';

import SavePostModal from '../components/SavePostModal';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PostEditorPage: React.FC<Props> = ({ editor, handleImagesUpload }) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);

    const handleConfirmSave = async () => {
        await editor.handleSave(); // 실제 저장 로직
        setIsSaveModalOpen(false);
    };

    return (
        <div className="flex flex-col xl:flex-row h-auto min-h-[85vh] gap-6 relative">
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
                onUpdate={(id, _, changes) => editor.handleUpdate(id, changes)}
                onDelete={() => {
                    if (editor.selectedId) editor.handleDelete(editor.selectedId);
                }}
                onBlockImageUpload={(id, file) => editor.handleBlockImageUpload(file, id)}
                onBackgroundClick={() => {
                    editor.setSelectedId(null);
                    editor.setSelectedType(null);
                }}
                paperStyles={editor.paperStyles} // ✨ Pass Styles
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
                onTempSave={() => editor.handleSave(true)} // ✨ Temp Save Handler
                onCancel={() => {
                    // ✨ Check Dirty
                    if (editor.isDirty && !confirm("작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?")) {
                        return;
                    }

                    // ✨ Cancel Logic: Smart Navigation
                    // If it's a draft (Temp Save), go back to List (Album/Folder)
                    // If it's a published post (Edit), go back to Read Mode
                    const isDraft = editor.currentTags.includes('임시저장');

                    if (editor.currentPostId && !isDraft) {
                        editor.setViewMode('read');
                    } else {
                        // Draft or New Post -> Go to Album/Folder
                        if (editor.selectedAlbumId && editor.selectedAlbumId !== '__all__' && editor.selectedAlbumId !== '__others__') {
                            editor.setViewMode('folder');
                        } else {
                            editor.setViewMode('album');
                        }
                    }
                }}
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
                applyPaperPreset={editor.applyPaperPreset}
                onSaveAsTemplate={editor.handleSaveAsTemplate}
                myTemplates={editor.myTemplates}
                applyTemplate={editor.applyTemplate}
            />

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
                mode={editor.mode}
                setMode={editor.setMode}
                isFavorite={editor.isFavorite}
                setIsFavorite={editor.setIsFavorite}
                isPublic={editor.isPublic}
                setIsPublic={editor.setIsPublic}
            />
        </div>
    );
};

export default PostEditorPage;
