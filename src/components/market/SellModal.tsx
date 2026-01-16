import React, { useState } from 'react';
import { X, Tag, FileText, DollarSign, Image as ImageIcon } from 'lucide-react';
import CustomWidgetPreview from '../settings/widgets/customwidget/components/CustomWidgetPreview'; // ✨ Import Widget Preview

interface SellModalProps {
    item: any;
    onClose: () => void;
    onSubmit: (data: { price: number; description: string; tags: string[]; imageFile?: File | null }) => void;
}

const SellModal: React.FC<SellModalProps> = ({ item, onClose, onSubmit }) => {
    const [price, setPrice] = useState(item.price ? String(item.price) : '1000');
    const [description, setDescription] = useState(item.description || '');
    const [tags, setTags] = useState<string[]>(item.tags || []);
    const [tagInput, setTagInput] = useState('');

    // ✨ 썸네일은 읽기 전용 (자동 생성된 것만 표시)
    const previewUrl = item.imageUrl || item.thumbnailUrl || null;

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = () => {
        const numPrice = parseInt(price, 10);
        if (isNaN(numPrice) || numPrice < 0) {
            alert('유효한 가격을 입력해주세요.');
            return;
        }
        // ✨ imageFile은 null로 전달 (썸네일은 자동 생성)
        onSubmit({ price: numPrice, description, tags, imageFile: null });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)] shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-[var(--text-primary)]">판매 등록</h2>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{item.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                        <X size={20} className="text-[var(--text-secondary)]" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Thumbnail Display - ✨ 읽기 전용 (자동 생성된 썸네일만 표시) */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase flex items-center gap-1">
                            <ImageIcon size={12} /> 썸네일 미리보기
                        </label>

                        <div className="w-full aspect-video bg-[var(--bg-card-secondary)] rounded-xl border border-[var(--border-color)] flex flex-col items-center justify-center overflow-hidden relative">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (item.widgetType === 'custom-block' || item.type === 'custom-block' || (item.type === 'template_widget' && item.content)) ? (
                                // ✨ Live Preview (Fallback if no thumbnail)
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <div className="w-full h-full transform scale-90 origin-center pointer-events-none select-none">
                                        <CustomWidgetPreview
                                            content={{
                                                ...item.content,
                                                decorations: item.decorations || [],
                                            }}
                                            defaultSize={item.defaultSize || '2x2'}
                                        />
                                    </div>
                                </div>
                            ) : item.widgetType ? (
                                // ✨ 위젯 썸네일 처리
                                item.widgetType.startsWith('custom-') ? (
                                    <div className="flex flex-col items-center justify-center text-[var(--btn-bg)]">
                                        <span className="text-4xl">🧩</span>
                                        <span className="text-xs font-bold mt-2">Custom Widget</span>
                                    </div>
                                ) : (
                                    <img
                                        src={`/thumbnails/${item.widgetType}.png`}
                                        alt={item.label}
                                        className="w-full h-full object-contain p-4"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
                                        }}
                                    />
                                )
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2" />
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">자동 생성된 썸네일</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-2">
                            * 썸네일은 자동으로 생성됩니다
                        </p>
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase flex items-center gap-1">
                            <DollarSign size={12} /> 판매 가격 (Credit)
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-3 bg-[var(--bg-card-secondary)] rounded-xl font-bold text-lg text-[var(--text-primary)] border border-transparent focus:border-[var(--btn-bg)] outline-none transition-all"
                            placeholder="0"
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase flex items-center gap-1">
                            <FileText size={12} /> 상품 설명
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 bg-[var(--bg-card-secondary)] rounded-xl text-sm text-[var(--text-primary)] border border-transparent focus:border-[var(--btn-bg)] outline-none transition-all resize-none h-24"
                            placeholder="상품에 대한 설명을 적어주세요..."
                        />
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase flex items-center gap-1">
                            <Tag size={12} /> 태그 (Enter로 추가)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 p-2 bg-[var(--bg-card-secondary)] rounded-lg text-sm text-[var(--text-primary)] border border-transparent focus:border-[var(--btn-bg)] outline-none transition-all"
                                placeholder="예: 심플, 고양이, 핑크..."
                            />
                            <button
                                onClick={handleAddTag}
                                className="px-4 py-2 bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] font-bold text-xs rounded-lg hover:bg-[var(--btn-bg)] hover:text-white transition-colors"
                            >
                                추가
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-[var(--btn-bg)]/10 text-[var(--btn-bg)] rounded-md text-xs font-bold flex items-center gap-1">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer - ✨ 취소 버튼 추가 */}
                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-card-secondary)] shrink-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] font-bold rounded-xl hover:bg-black/5 active:scale-95 transition-all border border-[var(--border-color)]"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-3 bg-[var(--btn-bg)] text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
                    >
                        등록하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellModal;
