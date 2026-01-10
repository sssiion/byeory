import React from 'react';
import { ChevronRight, Trash2, PenLine } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

import EditorCanvas from '../components/editor/EditorCanvas';
import { usePostEditor } from '../hooks/usePostEditor';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
}

const PostReadView: React.FC<Props> = ({ editor }) => {
    // ✨ Breadcrumb Logic
    const breadcrumbs = useBreadcrumbs(editor.selectedAlbumId, editor.customAlbums, (id) => id && editor.handleAlbumClick(id), '내 앨범', false);

    const handleDelete = async () => {
        if (!editor.currentPostId) return;
        await editor.handleDeletePost(editor.currentPostId);
    };

    return (
        <div className="flex flex-col h-auto min-h-[85vh] gap-6 relative items-center pb-32">
            {/* ✨ Breadcrumbs & Actions Header */}
            <div className="w-full max-w-[800px] flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-5 md:px-0 box-border gap-2 md:gap-0">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
                    <button
                        onClick={() => {
                            // Smart Back Logic: Go up one level in breadcrumbs if possible?
                            // Or just use the last parent's onClick?
                            // For simplicity, let's use the second to last item's onClick (parent),
                            // or default to Album view if only 1 item.
                            if (breadcrumbs.length > 0) {
                                const parent = breadcrumbs[breadcrumbs.length - 1]; // breadcrumbs currently has [Home], [Album]...
                                parent.onClick?.();
                            } else {
                                editor.setViewMode('album');
                            }
                        }}
                        className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] rounded-full transition-colors shrink-0"
                        title="뒤로 가기"
                    >
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="overflow-x-auto no-scrollbar">
                        <PostBreadcrumb items={[...breadcrumbs, { label: editor.title || '제목 없음' }]} />
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                        onClick={() => editor.setViewMode('editor')}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-secondary)] rounded-lg transition-all"
                        title="수정하기"
                    >
                        <PenLine size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="기록 삭제"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <EditorCanvas
                title={editor.title} setTitle={editor.setTitle}
                titleStyles={editor.titleStyles}
                viewMode={'read'}
                paperStyles={editor.paperStyles}
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

export default PostReadView;
