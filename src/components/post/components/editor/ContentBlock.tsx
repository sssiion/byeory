import React, { useRef, useEffect, useState } from 'react';
import type { Block } from '../../types';
import { Trash2, GripVertical, Mic, MicOff } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Props {
    block: Block;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: (id: string) => void;
    onImageUpload: (id: string, file: File, index?: number) => void;
    isSelected: boolean;
    onSelect: () => void;
    readOnly: boolean;
    dragHandleProps?: any;
}

const ContentBlock: React.FC<Props> = ({ block, onUpdate, onDelete, onImageUpload, isSelected, onSelect, readOnly, dragHandleProps }) => {
    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // ✨ 음성 인식 관련 Hook 및 State
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // 현재 이 블록에서 녹음 중인지 판별하기 위한 상태
    const [isRecordingHere, setIsRecordingHere] = useState(false);
    // 녹음 시작 전의 기존 텍스트를 저장해두는 Ref
    const baseTextRef = useRef(block.text || '');
    // 텍스트 높이 자동 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [block.text, block.styles]);
    // ✨ 음성 인식 텍스트 동기화 로직
    useEffect(() => {
        if (listening && isRecordingHere) {
            // 기존 텍스트 + 공백 + 인식된 텍스트
            const newText = `${baseTextRef.current} ${transcript}`.trim();
            onUpdate(block.id, 'text', newText);
        }
    }, [transcript, listening, isRecordingHere]);

    // ✨ 녹음 토글 함수
    const toggleRecording = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!browserSupportsSpeechRecognition) {
            alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
            return;
        }

        if (listening) {
            // 멈춤
            SpeechRecognition.stopListening();
            setIsRecordingHere(false);
        } else {
            // 시작
            onSelect(); // 블록 선택 처리
            baseTextRef.current = block.text || ''; // 현재 텍스트 저장
            resetTranscript(); // 이전 인식 기록 초기화
            setIsRecordingHere(true);
            SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });
        }
    };
    const triggerFile = (idx: number) => idx === 1 ? fileInputRef1.current?.click() : fileInputRef2.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imgIndex: number) => {
        if (e.target.files?.[0]) onImageUpload(block.id, e.target.files[0], imgIndex);
    };

    const handleDeleteImage = (e: React.MouseEvent, imgIndex: number) => {
        e.stopPropagation();
        onUpdate(block.id, imgIndex === 1 ? 'imageUrl' : 'imageUrl2', '');
    };

    const toggleImageFit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFit = block.imageFit === 'contain' ? 'cover' : 'contain';
        onUpdate(block.id, 'imageFit', newFit);
    };

    const s = block.styles || {};
    const imgHeight = s.imageHeight || '300px';



    // 이미지 영역 렌더링 함수
    const renderImageArea = (url: string | undefined, index: number, isFull: boolean = false) => {
        const fitMode = block.imageFit || 'cover';
        if (!url && readOnly) return null;

        return (
            <div
                onClick={(e) => { e.stopPropagation(); if (!readOnly) { onSelect(); if (!url) triggerFile(index); } }}
                className={`relative rounded-lg overflow-hidden group/img transition-all bg-gray-50
                    ${!url ? 'border-2 border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center' : ''} 
                    ${isSelected && !readOnly ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}
                    ${isFull ? 'w-full' : 'h-full'} 
                `}
                style={{ height: url ? imgHeight : '200px' }}
            >
                {url ? (
                    <>
                        <img
                            src={url}
                            className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                            style={{ transform: `rotate(${block.imageRotation || 0}deg)` }}
                            alt="img"
                        />
                        {!readOnly && (
                            <>
                                <button onClick={(e) => handleDeleteImage(e, index)} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition z-10">×</button>
                                <button onClick={toggleImageFit} className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-xs px-2 py-1 rounded shadow text-gray-700 opacity-0 group-hover/img:opacity-100 transition z-10 font-bold">{fitMode === 'contain' ? '↔ 꽉 채우기' : '🖼 원본 비율'}</button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-gray-400 hover:text-indigo-500 text-center select-none">
                        <span className="text-2xl block mb-1">📷</span>
                        <span className="text-xs font-bold">사진 추가</span>
                    </div>
                )}
                <input type="file" hidden ref={index === 1 ? fileInputRef1 : fileInputRef2} onChange={(e) => handleFileChange(e, index)} accept="image/*" />
            </div>
        );
    };

    return (
        <div className={`group relative mb-6 flex gap-6 items-start rounded-xl transition ${readOnly ? '' : `hover:bg-gray-50 ${isSelected ? 'bg-gray-50' : ''}`}`} onClick={(e) => { e.stopPropagation(); if (!readOnly) onSelect(); }}>

            {!readOnly && (
                <>
                    {/* 드래그 핸들 (isSelected일 때도 DOM에는 존재해야 에러 안 남 -> 투명 처리) */}
                    <div
                        {...dragHandleProps}
                        className={`absolute -left-10 top-1 p-1.5 text-gray-400 hover:text-indigo-600 rounded cursor-grab active:cursor-grabbing transition z-50
                            ${isSelected ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}
                        `}
                    >
                        <GripVertical size={20} />
                    </div>

                    {/* ✨ 마이크 버튼 (좌측 사이드바, 드래그 핸들 아래) */}
                    <button
                        onClick={toggleRecording}
                        className={`absolute -left-10 top-9 p-1.5 rounded transition-all duration-200 flex items-center justify-center z-50
                            ${isRecordingHere && listening
                                ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-200 opacity-100'
                                : 'bg-transparent text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100'
                            }
                        `}
                        title={listening ? "음성 인식 중지" : "음성으로 입력하기"}
                    >
                        {isRecordingHere && listening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {/* 삭제 버튼 (선택 안 될 때만 표시) */}
                    {!isSelected && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                            className="absolute -right-12 top-0 bg-white border border-gray-200 shadow-sm p-1.5 rounded text-red-500 hover:bg-red-50 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </>
            )}

            {/* 1. 꽉찬 사진 + 아래 글 */}
            {block.type === 'image-full' && (
                <div className="w-full flex flex-col gap-4">
                    {renderImageArea(block.imageUrl, 1, true)}
                    <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />

                </div>
            )}

            {/* 2. 사진 2장 + 아래 글 */}
            {block.type === 'image-double' && (
                <div className="w-full flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="w-1/2">{renderImageArea(block.imageUrl, 1, true)}</div>
                        <div className="w-1/2">{renderImageArea(block.imageUrl2, 2, true)}</div>
                    </div>

                </div>
            )}

            {/* 3. 사진 왼쪽 + 글 오른쪽 */}
            {block.type === 'image-left' && (
                <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    <div className="w-full md:w-1/2 flex-shrink-0">{renderImageArea(block.imageUrl, 1, true)}</div>
                    <div className="w-full md:flex-1 min-w-0 md:pt-2 relative">
                        <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />
                    </div>
                </div>
            )}

            {/* 4. 글 왼쪽 + 사진 오른쪽 */}
            {block.type === 'image-right' && (
                <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    {/* Mobile: Image First, Text Second? Or Text first? Usually stacked = Image top is standard for blog cards, but for 'Image Right' layout, preserving text first on mobile is fine, OR moving image to top. Let's keep DOM order for now (Text top) but common pattern is Image Top. Let's swap order for mobile? No, let's keep text top to match DOM flow unless user asks. */}
                    {/* Actually, standard responsive 'Image Right' often becomes 'Image Top' or 'Image Bottom'. Let's stick to 'Text Top' (natural flow) for now. */}
                    <div className="w-full md:flex-1 min-w-0 md:pt-2 relative order-2 md:order-1">
                        <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className="w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[3rem]" style={{ fontFamily: block.styles?.fontFamily, fontSize: block.styles?.fontSize || '18px', textAlign: block.styles?.textAlign as any || 'left', color: block.styles?.color || 'inherit' }} />
                    </div>
                    <div className="w-full md:w-1/2 flex-shrink-0 order-1 md:order-2">{renderImageArea(block.imageUrl, 1, true)}</div>
                </div>
            )}

            {/* 5. 글만 */}
            {block.type === 'paragraph' && (
                <div className="w-full">
                    <textarea ref={textareaRef} value={block.text} onChange={(e) => onUpdate(block.id, 'text', e.target.value)} placeholder={readOnly ? "" : "내용을 입력하세요..."} readOnly={readOnly} rows={1} className={`w-full block bg-transparent outline-none resize-none overflow-hidden leading-relaxed p-2 min-h-[75px] border-2 transition-colors rounded-lg ${isSelected ? 'border-indigo-200' : 'border-transparent'}`} style={{
                        fontFamily: block.styles?.fontFamily,
                        fontSize: block.styles?.fontSize || '18px',
                        textAlign: block.styles?.textAlign as any || 'left',
                        color: block.styles?.color || 'inherit',
                        fontWeight: block.styles?.fontWeight || 'normal',
                        fontStyle: block.styles?.fontStyle || 'normal',
                        textDecoration: block.styles?.textDecoration || 'none',
                        backgroundColor: block.styles?.backgroundColor || 'transparent',

                    }} />
                </div>
            )}
        </div>
    );
};


export default ContentBlock;