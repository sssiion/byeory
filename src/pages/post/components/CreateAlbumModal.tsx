import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, tags: string[]) => void;
}

const CreateAlbumModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [tags, setTags] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return alert("앨범 이름을 입력해주세요.");
        // 태그 처리 (콤마로 구분)
        const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== '');
        onSave(name, tagList);
        setName('');
        setTags('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-scale-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">새 앨범 만들기</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    {/* 1. 앨범 이름 */}
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

                    {/* 2. 표지 설정 (공사중) */}
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

                    {/* 3. 해시태그 (선택) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            해시태그 (선택)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="콤마(,)로 구분해 입력 (예: 서울, 강남)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                        <p className="text-xs text-gray-400 mt-1 ml-1">이 태그들이 포함된 글이 자동으로 분류됩니다.</p>
                    </div>

                    {/* 버튼 그룹 */}
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
