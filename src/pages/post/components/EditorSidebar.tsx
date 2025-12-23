import React, { useRef } from 'react';
import { STICKERS, LAYOUT_PRESETS } from '../constants';

interface Props {
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
    onAddBlock: () => void;
    onAddFloatingText: () => void;
    onAddSticker: (url: string) => void;
    onAddFloatingImage: (file: File) => void; // ✨ 추가
    // ... 나머지 기존 props
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
}

const EditorSidebar: React.FC<Props> = ({
                                            isSaving, onSave, onCancel,
                                            onAddBlock, onAddFloatingText, onAddSticker, onAddFloatingImage,
                                            rawInput, setRawInput, selectedLayoutId, setSelectedLayoutId,
                                            tempImages, fileInputRef, handleImagesUpload, onAiGenerate, isAiProcessing
                                        }) => {
    const triggerFileClick = () => fileInputRef.current?.click();

    // 자유 사진용 input ref
    const floatingImgRef = useRef<HTMLInputElement>(null);
    const handleFloatingImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            onAddFloatingImage(e.target.files[0]);
            e.target.value = ''; // 초기화
        }
    };

    return (
        <div className="w-80 flex flex-col gap-4">
            <div className="flex gap-2">
                <button onClick={onCancel} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-300">취소</button>
                <button onClick={onSave} disabled={isSaving} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg">{isSaving ? "저장..." : "저장"}</button>
            </div>

            <div className="bg-white p-5 rounded-xl shadow border border-indigo-50">
                <h3 className="font-bold mb-3 text-gray-800">🛠️ 꾸미기 도구</h3>
                <button onClick={onAddBlock} className="w-full mb-2 py-2 border rounded hover:bg-gray-50 text-sm">📝 줄글 상자 추가</button>
                <button onClick={onAddFloatingText} className="w-full mb-2 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded font-bold hover:bg-indigo-100 text-sm">📌 포스트잇 붙이기</button>

                {/* ✨ 자유 사진 버튼 */}
                <button onClick={() => floatingImgRef.current?.click()} className="w-full mb-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded font-bold hover:bg-blue-100 text-sm">
                    📸 자유 사진 붙이기
                </button>
                <input type="file" hidden ref={floatingImgRef} onChange={handleFloatingImgChange} accept="image/*" />

                <div className="pt-2 border-t">
                    <h4 className="text-xs font-bold text-gray-500 mb-2">🎨 스티커</h4>
                    <div className="grid grid-cols-4 gap-2">
                        {STICKERS.map((url, i) => (
                            <button key={i} onClick={() => onAddSticker(url)} className="hover:bg-gray-100 p-1 rounded"><img src={url} className="w-full h-full object-contain" alt="stk" /></button>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI 패널 (기존 동일) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col gap-3">
                {/* ... AI 내용 생략 (기존 코드 유지) ... */}
                <h3 className="font-bold text-gray-800">🤖 AI 기록 도우미</h3>
                <textarea value={rawInput} onChange={e => setRawInput(e.target.value)} className="w-full h-24 p-3 border rounded text-sm" placeholder="오늘 일기 내용..." />
                <div className="grid grid-cols-2 gap-2 mb-1">{LAYOUT_PRESETS.map(l => (<button key={l.id} onClick={() => setSelectedLayoutId(l.id)} className={`text-xs p-2 rounded border ${selectedLayoutId === l.id ? 'bg-indigo-50 border-indigo-500' : ''}`}>{l.name}</button>))}</div>
                <div className="p-3 bg-gray-50 rounded border"><button onClick={triggerFileClick} className="w-full text-indigo-500 text-sm">+ AI 참조 사진</button></div>
                <button onClick={onAiGenerate} disabled={isAiProcessing} className="w-full bg-indigo-600 text-white py-3 rounded font-bold">{isAiProcessing ? "생성 중..." : "AI 생성"}</button>
                <input type="file" hidden ref={fileInputRef} onChange={handleImagesUpload} multiple accept="image/*" />
            </div>
        </div>
    );
};

export default EditorSidebar;