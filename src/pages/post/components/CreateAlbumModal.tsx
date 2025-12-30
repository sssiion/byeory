import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, tags: string[]) => void;
}

const CreateAlbumModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return alert("앨범 이름을 입력해주세요.");
        onSave(name, selectedTag ? [selectedTag] : []); // 호환성을 위해 배열로 전달하지만 실제론 1개
        setName('');
        setSelectedTag(null);
        setTagInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag) {
                setSelectedTag(newTag);
                setTagInput('');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-scale-up">
                {/* ... (Header) ... */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">새 앨범 만들기</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {/* 1. 앨범 이름 UI 유지 ... */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            앨범 이름 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 맛집 탐방, 여행 기록"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                    </div>

                    {/* 2. 표지 설정 UI 유지 ... */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            표지 설정
                        </label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-not-allowed group">
                            <ImageIcon size={32} className="mb-2 opacity-50 group-hover:scale-110 transition" />
                            <span className="text-xs font-bold">공사중 🚧</span>
                            <span className="text-[10px] mt-1">추후 업데이트 예정입니다.</span>
                        </div>
                    </div>

                    {/* 3. 대표 해시태그 (단일) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            대표 해시태그
                        </label>
                        <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition bg-white flex flex-wrap gap-2 items-center">
                            {selectedTag ? (
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium flex items-center gap-1">
                                    #{selectedTag}
                                    <button onClick={() => setSelectedTag(null)} className="hover:text-indigo-900 rounded-full p-0.5">
                                        <X size={12} />
                                    </button>
                                </span>
                            ) : (
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="태그 입력 후 엔터"
                                    className="flex-1 outline-none min-w-[120px] bg-transparent"
                                />
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 ml-1">이 앨범을 대표할 태그 하나를 설정해주세요.</p>
                    </div>

                    <div className="flex gap-3 mt-4 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAlbumModal;
