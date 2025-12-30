import React from 'react';
import EditorCanvas from '../components/editor/EditorCanvas';
import { usePostEditor } from '../hooks/usePostEditor';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
}

const PostViewPage: React.FC<Props> = ({ editor }) => {
    return (
        <div className="flex h-auto min-h-[85vh] gap-6 relative justify-center">
            <EditorCanvas
                title={editor.title} setTitle={editor.setTitle}
                titleStyles={editor.titleStyles}
                viewMode={'read'} setViewMode={editor.setViewMode as any}
                blocks={editor.blocks} setBlocks={editor.setBlocks}
                stickers={editor.stickers} floatingTexts={editor.floatingTexts}
                floatingImages={editor.floatingImages}
                selectedId={null}
                selectedType={null}
                onSelect={() => { }}
                onUpdate={() => { }}
                onDelete={() => { }}
                onBlockImageUpload={() => { }}
                onBackgroundClick={() => { }}
            />
        </div>
    );
};

export default PostViewPage;
