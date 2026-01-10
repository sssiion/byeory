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

const PostCreateView: React.FC<Props> = ({ editor, handleImagesUpload }) => {
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
        // ✨ Auto-Generate Thumbnail
        if (canvasRef.current) {
            try {
                const dataUrl = await domToPng(canvasRef.current, {
                    scale: 0.5,
                    // backgroundColor: '#ffffff', // Removed to allow background images/colors to show
                });

                if (dataUrl) {
                    const blob = await (await fetch(dataUrl)).blob();
                    const file = new File([blob], `tmpl-${Date.now()}.png`, { type: "image/png" });
                    const url = await uploadImageToSupabase(file);

                    if (url) {
                        // alert(`Debug: 썸네일 생성 성공!\nURL: ${url}`);
                    } else {
                        // alert(`Debug: 썸네일 업로드 실패 (Supabase Error)`);
                    }

                    editor.handleSaveAsTemplate(url || undefined);
                } else {
                    // alert("Debug: 썸네일 캡처 데이터 없음");
                    editor.handleSaveAsTemplate();
                }
            } catch (e: any) {
                console.warn("Thumbnail capture failed", e);
                // alert(`Debug Error: ${e?.message}`);
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
                ref={canvasRef}
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
                paperStyles={editor.paperStyles}
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
                }}
                onCancel={() => editor.setViewMode('album')}
                onAddBlock={() => editor.setBlocks([...editor.blocks, { id: `m-${Date.now()}`, type: 'paragraph', text: '' }])}
                onAddFloatingText={editor.addFloatingText}
                onAddSticker={editor.addSticker}
                onAddFloatingImage={editor.addFloatingImage}
                onAddWidgetSticker={editor.addWidgetSticker} // ✨ Pass Widget Adder
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

export default PostCreateView;
