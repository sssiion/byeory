import React from 'react';
import EditorCanvas from '../components/editor/EditorCanvas';
import EditorSidebar from '../components/editor/EditorSidebar';
import { usePostEditor } from '../hooks/usePostEditor';

import SavePostModal from '../components/SavePostModal';


import { domToPng } from 'modern-screenshot';
import { uploadImageToSupabase } from '../api';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PostEditorPage: React.FC<Props> = ({ editor, handleImagesUpload }) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
    const canvasRef = React.useRef<HTMLDivElement>(null);

    const handleConfirmSave = async () => {
        const result = await editor.handleSave(); // 실제 저장 로직
        setIsSaveModalOpen(false);

        if (result?.message) {
            editor.showConfirmModal(
                result.success ? '저장 완료' : '저장 실패',
                result.message,
                result.type || (result.success ? 'success' : 'danger'),
                undefined,
                true
            );
        }
    };

    const handleSaveAsTemplateWrapper = async () => {
        // ✨ Auto-Generate Thumbnail (Synced with CreatePage)
        if (canvasRef.current) {
            try {
                const dataUrl = await domToPng(canvasRef.current, {
                    scale: 0.5,
                    // backgroundColor: '#ffffff',
                });

                if (dataUrl) {
                    const blob = await (await fetch(dataUrl)).blob();
                    const file = new File([blob], `tmpl-${Date.now()}.png`, { type: "image/png" });
                    const url = await uploadImageToSupabase(file);
                    editor.handleSaveAsTemplate(url || undefined);
                } else {
                    editor.handleSaveAsTemplate();
                }
            } catch (e: any) {
                console.warn("Thumbnail capture failed", e);
                // alert(`Error: ${e?.message}`);
                editor.handleSaveAsTemplate();
            }
        } else {
            editor.handleSaveAsTemplate();
        }
    };

    return (
        <div className="flex flex-col xl:flex-row h-auto min-h-[85vh] gap-6 relative">
            {/* 메인 캔버스 */}
            <EditorCanvas
                ref={canvasRef} // ✨ Pass Ref
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
                        editor.showConfirmModal('입력 확인', "제목을 입력해주세요!", 'danger', undefined, true);
                        return;
                    }
                    const hasContent = editor.blocks.some(b => b.text?.trim() || b.imageUrl || b.imageUrl2) ||
                        editor.stickers.length > 0 ||
                        editor.floatingTexts.length > 0 ||
                        editor.floatingImages.length > 0;

                    if (!hasContent) {
                        editor.showConfirmModal('입력 확인', "내용을 입력해주세요!", 'danger', undefined, true);
                        return;
                    }

                    setIsSaveModalOpen(true);
                }}
                onTempSave={async () => {
                    const result = await editor.handleSave(true);
                    if (result?.message) {
                        editor.showConfirmModal(
                            result.success ? '임시 저장' : '저장 실패',
                            result.message,
                            result.type || (result.success ? 'success' : 'danger'),
                            undefined,
                            true
                        );
                    }
                }} // ✨ Temp Save Handler
                onCancel={() => {
                    const proceed = () => {
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
                    };

                    // ✨ Check Dirty
                    if (editor.isDirty) {
                        editor.showConfirmModal(
                            "나가기 확인",
                            "작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?",
                            "danger",
                            proceed
                        );
                    } else {
                        proceed();
                    }
                }}
                onAddBlock={() => editor.setBlocks([...editor.blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                onAddFloatingText={editor.addFloatingText}
                onAddSticker={editor.addSticker}
                onAddFloatingImage={editor.addFloatingImage}
                onAddWidgetSticker={editor.addWidgetSticker} // ✨ Pass Widget Adder (Verified)
                rawInput={editor.rawInput} setRawInput={editor.setRawInput}
                selectedLayoutId={editor.selectedLayoutId} setSelectedLayoutId={editor.setSelectedLayoutId}
                tempImages={editor.tempImages} setTempImages={editor.setTempImages}
                fileInputRef={editor.fileInputRef as React.RefObject<HTMLInputElement>} handleImagesUpload={handleImagesUpload}
                onAiGenerate={editor.handleAiGenerate} isAiProcessing={editor.isAiProcessing}
                currentTags={editor.currentTags}
                onTagsChange={editor.setTags}
                applyPaperPreset={editor.applyPaperPreset}
                onSaveAsTemplate={handleSaveAsTemplateWrapper}
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
