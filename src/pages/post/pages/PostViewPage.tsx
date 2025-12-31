import React, { useMemo } from 'react';
import { ChevronRight, Home, Trash2, Folder, PenLine } from 'lucide-react';
import PostBreadcrumb from '../components/PostBreadcrumb';

import EditorCanvas from '../components/editor/EditorCanvas';
import { usePostEditor } from '../hooks/usePostEditor';

interface Props {
    editor: ReturnType<typeof usePostEditor>;
}

const PostViewPage: React.FC<Props> = ({ editor }) => {
    // ✨ Breadcrumb Logic
    const breadcrumbs = useMemo(() => {
        const items = [
            { label: '내 앨범', onClick: () => { editor.handleAlbumClick(null); editor.setViewMode('album'); }, icon: Home }
        ];

        if (editor.selectedAlbumId) {
            const album = editor.customAlbums.find(a => a.id === editor.selectedAlbumId);
            if (album) {
                items.push({
                    label: album.name,
                    onClick: () => { editor.setViewMode('folder'); },
                    icon: Folder
                });
            }
        } else {
            // If selectedAlbumId is null, it effectively means "Unclassified" (Others) path technically,
            // depending on how PostFolderPage handles it. 
            // But if we are in 'read' mode, we might just want to show "Others" if we came from there.
            // However, editor.selectedAlbumId is stateful.
            // If we just came from Album page directly (impossible?), or from Others.
            // Let's assume if we are here, we have a context.
            // If null, we can add "미분류" for clarity if desired, or just skip.
            // For now, let's treat null as "Unclassified" if the user wants to go back there.
            items.push({
                label: '미분류 보관함',
                onClick: () => { editor.setViewMode('folder'); },
                icon: Folder
            });
        }
        return items;
    }, [editor.selectedAlbumId, editor.customAlbums]);

    const handleDelete = async () => {
        if (!editor.currentPostId) return;
        if (confirm('정말 이 기록을 삭제하시겠습니까?')) {
            await editor.deletePost(editor.currentPostId);
        }
    };

    return (
        <div className="flex flex-col h-auto min-h-[85vh] gap-6 relative items-center">
            {/* ✨ Breadcrumbs & Actions Header */}
            <div className="w-full max-w-[800px] flex justify-between items-center py-2 px-1 mb-0">
                <div className="flex items-center gap-3">
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
                        className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] rounded-full transition-colors"
                        title="뒤로 가기"
                    >
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <PostBreadcrumb items={[...breadcrumbs, { label: editor.title || '제목 없음' }]} />
                </div>

                <div className="flex items-center gap-2">
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
