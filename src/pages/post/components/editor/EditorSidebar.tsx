import React, { useRef } from 'react';
import { STICKERS, LAYOUT_PRESETS } from '../../constants';
import { Save, X, Type, StickyNote, Image as ImageIcon, Sparkles, Upload, Layout, Plus, Palette, Bot } from 'lucide-react';




interface Props {
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onAddBlock: () => void;
    onAddFloatingText: () => void;
    onAddSticker: (url: string) => void;
    onAddFloatingImage: (file: File) => void;
    rawInput: string;
    setRawInput: (v: string) => void;
    selectedLayoutId: string;
    setSelectedLayoutId: (id: string) => void;
    tempImages: string[];
    setTempImages: (imgs: string[]) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAiGenerate: () => void;
    isAiProcessing: boolean;
    // New Props for Save Location
    currentTags: string[];
    onTagsChange: (tags: string[]) => void;
}

const EditorSidebar: React.FC<Props> = ({
    isSaving, onSave, onCancel,
    onAddBlock, onAddFloatingText, onAddSticker, onAddFloatingImage,
    rawInput, setRawInput, selectedLayoutId, setSelectedLayoutId,
    tempImages, fileInputRef, handleImagesUpload, onAiGenerate, isAiProcessing,
    currentTags, onTagsChange
}) => {
    const triggerFileClick = () => fileInputRef.current?.click();

    // 자유 사진용 input ref
    const floatingImgRef = useRef<HTMLInputElement>(null);
    const handleFloatingImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onAddFloatingImage(e.target.files[0]);
            e.target.value = ''; // 초기화
        }
    };

    return (
        <div className="w-80 flex flex-col gap-5 h-full overflow-y-auto pr-1 pb-10">
            {/* 상단 액션 버튼 */}
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] transition-all flex items-center justify-center gap-2"
                >
                    <X size={18} />
                    취소
                </button>
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} />
                    {isSaving ? "저장 중..." : "저장"}
                </button>
            </div>

            {/* SaveLocationWidget Removed - Moved to Modal */}

            {/* 꾸미기 도구 섹션 */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Palette size={18} className="text-[var(--text-secondary)]" />
                        꾸미기 도구
                    </h3>
                </div>

                <div className="p-4 flex flex-col gap-3">
                    <button
                        onClick={onAddBlock}
                        className="w-full py-3 px-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-secondary)] hover:border-indigo-200 transition-all text-sm font-medium text-[var(--text-primary)] flex items-center gap-3 group bg-white/50"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <Type size={18} />
                        </div>
                        <span className="flex-1 text-left">줄글 상자 추가</span>
                        <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                    </button>

                    <button
                        onClick={onAddFloatingText}
                        className="w-full py-3 px-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-secondary)] hover:border-yellow-200 transition-all text-sm font-medium text-[var(--text-primary)] flex items-center gap-3 group bg-white/50"
                    >
                        <div className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                            <StickyNote size={18} />
                        </div>
                        <span className="flex-1 text-left">포스트잇 붙이기</span>
                        <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400" />
                    </button>

                    <button
                        onClick={() => floatingImgRef.current?.click()}
                        className="w-full py-3 px-4 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-card-secondary)] hover:border-blue-200 transition-all text-sm font-medium text-[var(--text-primary)] flex items-center gap-3 group bg-white/50"
                    >
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <ImageIcon size={18} />
                        </div>
                        <span className="flex-1 text-left">자유 사진 붙이기</span>
                        <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                    </button>
                    <input type="file" hidden ref={floatingImgRef} onChange={handleFloatingImgChange} accept="image/*" />
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 mt-2 uppercase tracking-wider">Stickers</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {STICKERS.map((url, i) => (
                            <button
                                key={i}
                                onClick={() => onAddSticker(url)}
                                className="aspect-square hover:bg-[var(--bg-card-secondary)] p-1.5 rounded-xl border border-transparent hover:border-[var(--border-color)] transition-all active:scale-95"
                            >
                                <img src={url} className="w-full h-full object-contain filter drop-shadow-sm" alt="sticker" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ✨ Tags Section (Real-time Visualization) */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span className="text-lg">🏷️</span>
                        태그
                    </h3>
                </div>
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                        {currentTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-[var(--btn-bg)] text-[var(--btn-text)] text-xs rounded-full flex items-center gap-1 opacity-90">
                                #{tag}
                                <button onClick={() => onTagsChange(currentTags.filter(t => t !== tag))} className="hover:text-red-200"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                    <input
                        placeholder="태그 입력 (Space/Ent)"
                        className="w-full p-2 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:border-[var(--btn-bg)] transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                    // Remove # if present
                                    const tag = val.replace(/^#/, '');
                                    if (!currentTags.includes(tag)) {
                                        onTagsChange([...currentTags, tag]);
                                    }
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* AI 기록 도우미 */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30 flex items-center justify-between">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Bot size={18} className="text-[var(--text-secondary)]" />
                        AI 기록 도우미
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">BETA</span>
                </div>

                <div className="p-4 flex flex-col gap-4">
                    <textarea
                        value={rawInput}
                        onChange={e => setRawInput(e.target.value)}
                        className="w-full h-28 p-3 bg-[var(--bg-card-secondary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--btn-bg)] focus:border-transparent transition-all resize-none placeholder-gray-400"
                        placeholder="오늘 하루는 어떠셨나요? 키워드나 짧은 문장을 입력하시면 AI가 멋진 일기를 만들어드려요."
                    />

                    <div>
                        <span className="text-xs font-bold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Layout Style</span>
                        <div className="grid grid-cols-2 gap-2">
                            {LAYOUT_PRESETS.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => setSelectedLayoutId(l.id)}
                                    className={`text-xs px-3 py-2.5 rounded-lg border transition-all flex items-center justify-center gap-1.5
                                        ${selectedLayoutId === l.id
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold ring-1 ring-indigo-200'
                                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)]'
                                        }`}
                                >
                                    <Layout size={12} />
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={triggerFileClick}
                        className="w-full py-3 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--btn-bg)] hover:border-[var(--btn-bg)] hover:bg-indigo-50/30 transition-all text-xs font-medium flex flex-col items-center justify-center gap-1"
                    >
                        <Upload size={16} />
                        <span>AI 참조 사진 업로드 ({tempImages.length}장 선택됨)</span>
                    </button>

                    <button
                        onClick={onAiGenerate}
                        disabled={isAiProcessing}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        <Sparkles size={18} className={isAiProcessing ? "animate-spin" : ""} />
                        {isAiProcessing ? "AI가 이야기를 만드는 중..." : "AI로 일기 생성하기"}
                    </button>
                    <input type="file" hidden ref={fileInputRef} onChange={handleImagesUpload} multiple accept="image/*" />
                </div>
            </div>
        </div>
    );
};

export default EditorSidebar;