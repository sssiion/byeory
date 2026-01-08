import React, { useState } from 'react';
import { type RoomCycle, fetchCycleContentApi, saveCycleContentApi } from '../roomCycleApi';
import { Lock, CheckCheck, Save } from 'lucide-react';
import EditorCanvas from './editor/EditorCanvas';
import EditorSidebar from './editor/EditorSidebar';
import { usePostEditor } from '../hooks/usePostEditor';


interface Props {
    cycle: RoomCycle;
    onPassTurn: () => Promise<void>;
}

const RollingPaperView: React.FC<Props> = ({ cycle, onPassTurn }) => {
    // We reuse the Post Editor Hook logic but adapted for this view
    // Since we are not in a full 'Page', we might need to mock some routing params or use them 
    // However, EditorCanvas expects 'blocks', 'stickers' etc. which usePostEditor provides.
    // For MVP, we will instantiate the hook here. 
    // Ideally, we should refactor usePostEditor to be more portable, but let's try to use it.

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Editor Hook (Empty initially)
    const editor = usePostEditor();

    // State for completed view data
    const [completedData, setCompletedData] = useState<any>(null);

    // ✨ Load Shared Content (API Flow 1)
    React.useEffect(() => {
        const loadSharedContent = async () => {
            // Load if it's my turn OR if it's completed
            if ((cycle.status === 'IN_PROGRESS' && cycle.isMyTurn) || cycle.status === 'COMPLETED') {
                try {
                    const data = await fetchCycleContentApi(cycle.id);
                    if (data) {
                        if (cycle.status === 'COMPLETED') {
                            setCompletedData(data);
                            return;
                        }

                        // 🔒 Lock all fetched items (previous users' work)
                        const lockedBlocks = data.blocks?.map((b: any) => ({ ...b, locked: true })) || [];
                        const lockedStickers = data.stickers?.map((s: any) => ({ ...s, locked: true })) || [];
                        const lockedTexts = data.floatingTexts?.map((t: any) => ({ ...t, locked: true })) || [];
                        const lockedImages = data.floatingImages?.map((i: any) => ({ ...i, locked: true })) || [];

                        // ➕ Initialize Editor
                        editor.setTitle(data.title || cycle.title || "");

                        // If no blocks, add one empty paragraph for convenience
                        if (lockedBlocks.length === 0) {
                            editor.setBlocks([{ id: `new-${Date.now()}`, type: 'paragraph', text: '' }]);
                        } else {
                            editor.setBlocks([...lockedBlocks, { id: `new-${Date.now()}`, type: 'paragraph', text: '' }]);
                        }

                        editor.setStickers(lockedStickers);
                        editor.setFloatingTexts(lockedTexts);
                        editor.setFloatingImages(lockedImages);
                    }
                } catch (e) {
                    console.error("Failed to load shared content", e);
                }
            }
        };
        loadSharedContent();
    }, [cycle.isMyTurn, cycle.id, cycle.status]);

    // Stub for handleImagesUpload
    const handleImagesUpload = (_e: React.ChangeEvent<HTMLInputElement>) => {
        // Simple stub for now regarding RoomCycle context
        console.log("Image upload not fully supported in Rolling Paper MVP");
    };

    const handleCompleteTurn = async () => {
        if (!confirm("작성을 완료하고 다음 사람에게 넘기시겠습니까?\n작성 후에는 수정할 수 없습니다.")) return;

        setIsSubmitting(true);
        try {
            // 1. Construct the content object (JSON of blocks/stickers)
            // Note: We send everything (Locked + New)
            const contentPayload = {
                title: editor.title,
                blocks: editor.blocks,
                stickers: editor.stickers,
                floatingTexts: editor.floatingTexts,
                floatingImages: editor.floatingImages,
                titleStyles: editor.titleStyles,
            };

            // 2. Save Content (API Flow 2)
            await saveCycleContentApi(cycle.id, contentPayload);

            // 3. Pass Turn (API Flow 3)
            await onPassTurn();

        } catch (e) {
            console.error(e);
            alert("제출 실패. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✨ Temp Save Handler
    const handleTempSave = async () => {
        setIsSubmitting(true);
        try {
            const contentPayload = {
                title: editor.title,
                blocks: editor.blocks,
                stickers: editor.stickers,
                floatingTexts: editor.floatingTexts,
                floatingImages: editor.floatingImages,
                titleStyles: editor.titleStyles,
            };
            await saveCycleContentApi(cycle.id, contentPayload);
            alert("임시 저장되었습니다.");
            editor.setIsDirty(false); // ✨ Reset Dirty
        } catch (e) {
            console.error(e);
            alert("임시 저장 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✨ Prevent Accidental Refresh
    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (editor.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [editor.isDirty]);

    // 1. LOCKED / WAITING VIEW
    if (cycle.status === 'IN_PROGRESS' && !cycle.isMyTurn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Lock size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    {(() => {
                        const currentMember = cycle.members?.find(m => (m.order ?? m.turnOrder) === cycle.currentTurnOrder);
                        return currentMember ? `${currentMember.nickname}님 작성 중입니다...` : "누군가님이 작성 중입니다...";
                    })()}
                </h2>
                <p className="text-[var(--text-secondary)]">
                    조금만 기다려주세요! 내 순서가 되면 알림을 보내드릴게요.
                </p>
                <div className="mt-8 flex gap-2">
                    {cycle.members?.map((m) => (
                        <div key={m.userId} className={`w-3 h-3 rounded-full ${m.isCompleted ? 'bg-indigo-500' : ((m.order ?? m.turnOrder) === cycle.currentTurnOrder ? 'bg-yellow-400 animate-bounce' : 'bg-gray-200')}`} />
                    ))}
                </div>
            </div>
        );
    }

    // 2. MY TURN (EDITOR VIEW)
    if (cycle.status === 'IN_PROGRESS' && cycle.isMyTurn) {
        return (
            <div className="flex flex-col h-full overflow-hidden bg-gray-50 relative">
                {/* Header */}
                <div className="shrink-0 h-16 bg-white border-b flex items-center justify-between px-6 z-50">
                    <span className="font-bold text-lg">✏️ 나의 차례</span>
                    <div className="flex gap-2">
                        <button
                            onClick={handleTempSave}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            임시 저장
                        </button>
                        <button
                            onClick={handleCompleteTurn}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? '전송 중...' : '작성 완료'}
                        </button>
                    </div>
                </div>

                {/* Editor Body */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Sidebar */}
                    <div className="w-80 border-r bg-white shrink-0 overflow-y-auto hidden md:block">
                        <div className="p-4">
                            <EditorSidebar
                                containerClassName=""
                                showActionButtons={false}
                                isSaving={editor.isSaving}
                                onSave={() => { }} // Disabled in RollingPaper
                                onTempSave={handleTempSave} // ✨ Pass temp save handler
                                onCancel={() => { }} // Disabled
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
                                // ✨ Fix: Enable Design & Templates
                                applyPaperPreset={editor.applyPaperPreset}
                                onSaveAsTemplate={editor.handleSaveAsTemplate}
                                myTemplates={editor.myTemplates}
                                applyTemplate={editor.applyTemplate}
                            />
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 bg-gray-100 overflow-hidden relative">
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
                            onDelete={() => {
                                if (editor.selectedId) {
                                    editor.handleDelete(editor.selectedId);
                                }
                            }}
                            onBlockImageUpload={(id, file) => {
                                editor.handleBlockImageUpload(file, id);
                            }}
                            onBackgroundClick={() => {
                                editor.setSelectedId(null);
                                editor.setSelectedType(null);
                            }}
                            paperStyles={editor.paperStyles} // ✨ Fix: Apply Paper Styles
                        />
                    </div>
                </div>
            </div>
        );
    }

    // 3. COMPLETED VIEW (READ ONLY)
    // Display the final rolling paper as a single canvas
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50 relative">
            <div className="shrink-0 h-16 bg-white border-b flex items-center justify-center px-6 z-50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <CheckCheck className="text-green-500" />
                    완성된 롤링페이퍼
                </h2>
            </div>

            <div className="flex-1 bg-gray-100 overflow-hidden relative">
                {completedData ? (
                    <EditorCanvas
                        title={completedData.title || cycle.title}
                        setTitle={() => { }} // ReadOnly
                        titleStyles={completedData.titleStyles}
                        viewMode={'read'} // Read Only Mode
                        blocks={completedData.blocks || []} setBlocks={() => { }}
                        stickers={completedData.stickers || []} floatingTexts={completedData.floatingTexts || []}
                        floatingImages={completedData.floatingImages || []}
                        selectedId={null}
                        selectedType={null}
                        onSelect={() => { }}
                        onUpdate={() => { }}
                        onDelete={() => { }}
                        onBlockImageUpload={() => { }}
                        onBackgroundClick={() => { }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        불러오는 중...
                    </div>
                )}
            </div>
        </div>
    );
};

export default RollingPaperView;
