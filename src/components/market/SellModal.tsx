import React, { useState, useRef } from 'react';
import { X, Tag, FileText, DollarSign, Image as ImageIcon, Upload } from 'lucide-react';

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
    const [imageFile, setImageFile] = useState<File | null>(null);
    // ✨ Initialize with thumbnail if available
    const [previewUrl, setPreviewUrl] = useState<string | null>(item.imageUrl || item.thumbnailUrl || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
        onSubmit({ price: numPrice, description, tags, imageFile });
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
                    {/* Thumbnail Upload / Display */}
                    {!['template_post', 'TEMPLATE_POST', 'template_widget', 'TEMPLATE_WIDGET'].includes(item.type) && (
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase flex items-center gap-1">
                                <ImageIcon size={12} /> 썸네일 이미지
                            </label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video bg-[var(--bg-card-secondary)] rounded-xl border border-dashed border-[var(--border-color)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--btn-bg)] hover:bg-[var(--btn-bg)]/5 transition-all group overflow-hidden relative"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-[var(--btn-bg)] mb-2 transition-colors" />
                                        <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--btn-bg)] transition-colors">클릭하여 이미지 업로드</span>
                                    </>
                                )}
                                {/* Overlay for Change */}
                                {previewUrl && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                            <Upload size={12} /> 변경하기
                                        </span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                hidden
                            />
                        </div>
                    )}

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

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-card-secondary)] shrink-0">
                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-[var(--btn-bg)] text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg"
                    >
                        등록하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellModal;
