import React from 'react';
import EditorCanvas from '../components/editor/EditorCanvas';
import EditorSidebar from '../components/editor/EditorSidebar';
import { usePostEditor } from '../hooks/usePostEditor';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PostCreatePage: React.FC<Props> = ({ editor, handleImagesUpload }) => {
    return (
        <div className="flex h-auto min-h-[85vh] gap-6 relative">
            {/* 메인 캔버스 */}
            <EditorCanvas
                title={editor.title} setTitle={editor.setTitle}
                titleStyles={editor.titleStyles}
                viewMode={'editor'} setViewMode={editor.setViewMode as any}
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
            />

            {/* 오른쪽 사이드바 */}
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
        </div>
    );
};

export default PostCreatePage;
