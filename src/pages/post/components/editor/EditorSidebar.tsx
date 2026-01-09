import React, { useEffect, useRef, useState } from 'react';
import { STICKERS, LAYOUT_PRESETS, type StickerItemDef } from '../../constants';
import { PAPER_PRESETS } from '../../constants/paperPresets'; // ✨ Import
import { useMarket } from '../../../../hooks/useMarket';
import { Save, X, Type, StickyNote, Image as ImageIcon, Sparkles, Upload, Layout, Plus, Palette, Bot, Mic, MicOff, Check } from 'lucide-react';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Props {
    isSaving: boolean;
    onSave: () => void;
    onTempSave: () => void; // ✨ New Prop
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
    // New Props for Save Location
    currentTags: string[];
    onTagsChange: (tags: string[]) => void;
    // ✨ Paper Props
    applyPaperPreset: (preset: any) => void;
    defaultFontColor?: string;
    onSaveAsTemplate: () => void;
    myTemplates?: any[];
    applyTemplate?: (template: any) => void;
    containerClassName?: string;
    showActionButtons?: boolean;
    onAddWidgetSticker: (widgetType: string, props?: any) => void; // ✨ New Prop
}

import { useWidgetRegistry } from '../../../../components/settings/widgets/useWidgetRegistry'; // ✨ Import Registry

// Helper Component for safe image loading
const WidgetButton = ({ widget, onAdd }: { widget: any, onAdd: (type: string) => void }) => {
    const [imgError, setImgError] = React.useState(false);
    const thumbnailUrl = `/thumbnails/${widget.widgetType}.png`;

    return (
        <div key={widget.widgetType} className="group relative">
            <button
                onClick={() => onAdd(widget.widgetType)}
                className="w-full aspect-square rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)] hover:border-[var(--accent-color)] transition-all flex items-center justify-center bg-white shadow-sm overflow-hidden p-1.5"
            >
                {!imgError ? (
                    <img
                        src={thumbnailUrl}
                        alt={widget.label}
                        className="w-full h-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-[var(--accent-color)] bg-gradient-to-br from-white to-gray-50">
                        <span className="text-xl">🧩</span>
                    </div>
                )}
            </button>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {widget.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
        </div>
    );
};

const EditorSidebar: React.FC<Props> = ({
    isSaving, onSave, onTempSave, onCancel,
    onAddBlock, onAddFloatingText, onAddSticker, onAddFloatingImage,
    rawInput, setRawInput, selectedLayoutId, setSelectedLayoutId,
    tempImages, fileInputRef, handleImagesUpload, onAiGenerate, isAiProcessing,
    currentTags, onTagsChange, applyPaperPreset, onSaveAsTemplate,
    myTemplates = [], applyTemplate, containerClassName = "xl:w-80", showActionButtons = true,
    onAddWidgetSticker = (type) => console.warn("onAddWidgetSticker missing", type) // ✨ Destructure with default
}) => {
    // ... existing ...

    // ✨ Widget Registry
    const { registry: widgetRegistry } = useWidgetRegistry();
    const allWidgets = Object.values(widgetRegistry);

    const { isOwned, buyItem, getMarketItem, getPackPrice } = useMarket();

    // ... existing speech recognition code ...
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // 사이드바 전용 녹음 상태 관리
    const [isRecordingSidebar, setIsRecordingSidebar] = useState(false);
    const baseInputRef = useRef(rawInput); // 녹음 시작 전 텍스트 저장용

    // ✨ 음성 인식 텍스트 동기화
    useEffect(() => {
        if (listening && isRecordingSidebar) {
            // 기존 텍스트 + 공백 + 인식된 텍스트
            const newText = `${baseInputRef.current} ${transcript}`.trim();
            setRawInput(newText);
        }
    }, [transcript, listening, isRecordingSidebar, setRawInput]);

    // ✨ 녹음 토글 함수
    const toggleRecording = () => {
        if (!browserSupportsSpeechRecognition) {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
            return;
        }

        if (listening) {
            SpeechRecognition.stopListening();
            setIsRecordingSidebar(false);
        } else {
            baseInputRef.current = rawInput || ''; // 현재 입력된 값 저장
            resetTranscript();
            setIsRecordingSidebar(true);
            SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });
        }
    };

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'success' | 'danger';
        onConfirm: () => void;
        onSecondary?: () => void; // for Dual Option
        secondaryLabel?: string;
        confirmLabel?: string;
        singleButton?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
    });

    const triggerFileClick = () => fileInputRef.current?.click();

    // 자유 사진용 input ref
    const floatingImgRef = useRef<HTMLInputElement>(null);
    const handleFloatingImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onAddFloatingImage(e.target.files[0]);
            e.target.value = ''; // 초기화
        }
    };

    const handleStickerClick = async (sticker: StickerItemDef) => {
        // Check ownership
        const owned = !sticker.isPremium || isOwned(sticker.id) || (sticker.packId && isOwned(sticker.packId));
        if (owned) {
            onAddSticker(sticker.url);
            return;
        }

        // It is locked. Check if it belongs to a pack.
        if (sticker.packId) {
            const packItem = await getMarketItem(sticker.packId);
            if (packItem) {
                // Calculate Dynamic Price
                const packPrice = packItem.price;
                const dynamicPrice = getPackPrice(sticker.packId, packPrice);
                const discount = packPrice - dynamicPrice;

                setConfirmation({
                    isOpen: true,
                    title: '구매 옵션 선택',
                    message: `이 스티커는 '${packItem.title}'에 포함되어 있습니다.\n${discount > 0 ? `(기존 구매분 ${discount} C 할인됨!)\n` : ''}어떻게 구매하시겠습니까?`,
                    type: 'info',
                    singleButton: false,
                    confirmLabel: `이 팩 구매하기 (${dynamicPrice} C)`,
                    secondaryLabel: `이 스티커만 구매 (${sticker.price || 100} C)`,
                    onConfirm: async () => {
                        // Buy Pack
                        setConfirmation(prev => ({ ...prev, isOpen: false }));
                        if (await buyItem(packItem.id, dynamicPrice)) {
                            // alert('팩 구매가 완료되었습니다!'); // Using modal instead? or just silent refresh?
                            // Let's use a success modal
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 완료',
                                message: `'${packItem.title}' 구매가 완료되었습니다!`,
                                type: 'success',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        } else {
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 실패',
                                message: '크레딧이 부족하거나 오류가 발생했습니다.',
                                type: 'danger',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        }
                    },
                    onSecondary: async () => {
                        // Buy Individual
                        setConfirmation(prev => ({ ...prev, isOpen: false }));
                        if (await buyItem(sticker.id, sticker.price || 100)) {
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 완료',
                                message: '스티커 구매가 완료되었습니다!',
                                type: 'success',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        } else {
                            setTimeout(() => setConfirmation({
                                isOpen: true,
                                title: '구매 실패',
                                message: '크레딧이 부족하거나 오류가 발생했습니다.',
                                type: 'danger',
                                onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                                singleButton: true
                            }), 300);
                        }
                    }
                });
                return;
            }
        }

        // No pack or fetch failed, fallback to individual purchase
        setConfirmation({
            isOpen: true,
            title: '스티커 구매',
            message: `이 스티커를 ${sticker.price || 100} 크레딧에 구매하시겠습니까?`,
            type: 'info',
            singleButton: false,
            confirmLabel: '구매하기',
            onConfirm: async () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }));
                if (await buyItem(sticker.id, sticker.price || 100)) {
                    setTimeout(() => setConfirmation({
                        isOpen: true,
                        title: '구매 완료',
                        message: '스티커 구매가 완료되었습니다!',
                        type: 'success',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                        singleButton: true
                    }), 300);
                } else {
                    setTimeout(() => setConfirmation({
                        isOpen: true,
                        title: '구매 실패',
                        message: '크레딧이 부족합니다.',
                        type: 'danger',
                        onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false })),
                        singleButton: true
                    }), 300);
                }
            }
        });
    };

    return (
        <div className={`w-full ${containerClassName} flex flex-col gap-5 h-full overflow-y-auto pr-1 pb-10`}>
            {/* 상단 액션 버튼 */}
            {showActionButtons && (
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="py-3 px-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-card-secondary)] transition-all flex items-center justify-center"
                        title="취소"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={onTempSave} // ✨ Temp Save
                        disabled={isSaving}
                        className="flex-1 py-3 px-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                    >
                        <Save size={18} />
                        {isSaving ? "..." : "임시 저장"}
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex-1 py-3 px-3 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-xl font-bold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Check size={18} />
                        {isSaving ? "저장 중..." : "완료"}
                    </button>
                </div>
            )}

            {/* SaveLocationWidget Removed - Moved to Modal */}

            {/* ✨ 종이 디자인 섹션 */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Layout size={18} className="text-[var(--text-secondary)]" />
                        종이 디자인
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                    {Object.values(PAPER_PRESETS).map((preset: any) => (
                        <button
                            key={preset.id}
                            onClick={() => applyPaperPreset(preset)}
                            className="p-2 border border-[var(--border-color)] rounded-lg text-xs hover:bg-[var(--bg-card-secondary)] hover:border-indigo-200 transition text-[var(--text-secondary)] font-medium flex flex-col items-center gap-1"
                            style={{
                                backgroundColor: preset.styles.backgroundColor || '#fff',
                                color: preset.defaultFontColor || '#000'
                            }}
                        >
                            {preset.name}
                        </button>
                    ))}

                    <button
                        onClick={onSaveAsTemplate}
                        className="p-2 border border-[var(--border-color)] border-dashed rounded-lg text-xs hover:bg-[var(--bg-card-secondary)] hover:border-indigo-400 transition text-[var(--text-secondary)] font-medium flex flex-col items-center gap-1 justify-center bg-transparent"
                    >
                        <Save size={14} />
                        템플릿 저장
                    </button>
                </div>
            </div>

            {/* ✨ Widgets Section */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span className="text-lg">🧩</span>
                        위젯
                    </h3>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                        {allWidgets.map((widget) => (
                            <WidgetButton key={widget.widgetType} widget={widget} onAdd={onAddWidgetSticker} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ✨ 나의 템플릿 섹션 */}
            <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-card-secondary)]/30">
                    <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Save size={18} className="text-[var(--text-secondary)]" />
                        나의 템플릿
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                    {myTemplates.length > 0 ? (
                        myTemplates.map((template: any) => (
                            <button
                                key={template.id}
                                onClick={() => applyTemplate && applyTemplate(template)}
                                className="p-2 border border-[var(--border-color)] rounded-lg text-xs hover:bg-[var(--bg-card-secondary)] hover:border-indigo-200 transition text-[var(--text-secondary)] font-medium flex flex-col items-center gap-1"
                                style={{
                                    backgroundColor: template.styles?.backgroundColor || '#fff',
                                    color: template.defaultFontColor || '#000'
                                }}
                            >
                                <span className="truncate w-full text-center">{template.name}</span>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-2 text-center text-xs text-gray-400 py-2">
                            저장된 템플릿이 없습니다.
                        </div>
                    )}
                </div>
            </div>

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
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 mt-2 uppercase tracking-wider flex justify-between items-center">
                        Stickers
                        <a href="/market" className="text-[10px] text-indigo-500 hover:underline">Get more</a>
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                        {STICKERS.map((sticker) => {
                            // Check ownership
                            const owned = !sticker.isPremium || isOwned(sticker.id) || (sticker.packId && isOwned(sticker.packId));
                            const isLocked = !owned;

                            return (
                                <button
                                    key={sticker.id}
                                    title={isLocked ? `구매하기 (${sticker.price} C)` : '사용하기'}
                                    onClick={() => handleStickerClick(sticker)}
                                    className={`relative aspect-square hover:bg-[var(--bg-card-secondary)] p-1.5 rounded-xl border border-transparent hover:border-[var(--border-color)] transition-all active:scale-95 ${isLocked ? 'grayscale opacity-70' : ''}`}
                                >
                                    <img src={sticker.url} className="w-full h-full object-contain filter drop-shadow-sm" alt="sticker" />
                                    {isLocked && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl text-white drop-shadow-md">
                                            <span className="text-xs">🔒</span>
                                            <span className="text-[10px] font-bold">{sticker.price}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
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
                    <div className={`
                        relative w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-secondary)]
                        focus-within:ring-2 focus-within:ring-[var(--btn-bg)] focus-within:border-transparent transition-all
                    `}>
                        <textarea
                            value={rawInput}
                            onChange={e => setRawInput(e.target.value)}
                            // textarea 자체의 테두리(border)는 없애고(bg-transparent border-none), 부모 div가 테두리 역할을 합니다.
                            className="w-full h-28 p-3 pr-10 bg-transparent border-none outline-none resize-none placeholder-gray-400 text-sm"
                            placeholder="오늘 하루는 어떠셨나요? 키워드나 짧은 문장을 입력하시면 AI가 멋진 일기를 만들어드려요."
                        />
                        {/* 버튼은 Wrapper Div 안에 절대 위치로 고정됩니다 */}
                        <button
                            onClick={toggleRecording}
                            className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200
                                ${listening && isRecordingSidebar
                                    ? 'text-red-500 bg-red-50 animate-pulse'
                                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-200/50'
                                }
                            `}
                            title={listening ? "음성 인식 중지" : "음성으로 말하기"}
                        >
                            {listening && isRecordingSidebar ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                    </div>

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

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmation.onConfirm}
                onCancel={confirmation.onSecondary || (() => setConfirmation(prev => ({ ...prev, isOpen: false })))}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                singleButton={confirmation.singleButton}
                confirmText={confirmation.confirmLabel}
                cancelText={confirmation.secondaryLabel}
            />
        </div>
    );
};

export default EditorSidebar;