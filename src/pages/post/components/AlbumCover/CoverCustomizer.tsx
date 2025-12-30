import React, { useState } from 'react';
import { X, Check, Upload, Palette, Layout, Image as ImageIcon, Smile } from 'lucide-react';
import { COVER_COLORS, COVER_PATTERNS, COVER_ILLUSTRATIONS, PATTERN_SHAPES, STICKER_ICONS } from './constants';
import type { AlbumCoverConfig } from './constants';
import AlbumBook from './AlbumBook';

interface Props {
    initialConfig?: AlbumCoverConfig;
    albumTitle: string;
    albumTag?: string; // ✨ Add tag prop
    onSave: (config: AlbumCoverConfig) => void;
    onClose: () => void;
}

const CoverCustomizer: React.FC<Props> = ({ initialConfig, albumTitle, albumTag, onSave, onClose }) => {
    const [config, setConfig] = useState<AlbumCoverConfig>(initialConfig || {
        type: 'solid',
        value: COVER_COLORS[0].value,
        spineColor: COVER_COLORS[0].spine,
        labelColor: COVER_COLORS[0].text
    });

    // Main Tabs: Design (Presets) | My Design (Custom) | Sticker
    const [mainTab, setMainTab] = useState<'design' | 'my-design' | 'sticker'>('design');
    // Sub Tabs for Design: Color | Pattern | Illustration | Image
    const [designSubTab, setDesignSubTab] = useState<'color' | 'pattern' | 'illustration' | 'image'>('color');

    // My Design Internal State
    const [myDesignState, setMyDesignState] = useState({
        bg: COVER_COLORS[0].value,
        patternId: 'dots',
        patternColor: '#000000'
    });

    // Keep track of the last selected preset to restore it when switching back from My Design
    const [lastPreset, setLastPreset] = useState<AlbumCoverConfig>(config);

    // Helper to update config and save as last preset
    const applyPreset = (newConfig: AlbumCoverConfig) => {
        setConfig(newConfig);
        setLastPreset(newConfig);
    };

    // Handle Main Tab Switching
    const handleTabChange = (tab: 'design' | 'my-design' | 'sticker') => {
        setMainTab(tab);
        if (tab === 'design') {
            // Restore last preset to avoid "stuck" custom design
            setConfig(lastPreset);
        }
        // If switching TO my-design, the existing effect will auto-apply the custom pattern
    };

    // Scroll Lock
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Effect to update config when myDesignState changes
    React.useEffect(() => {
        if (mainTab === 'my-design') {
            const shape = PATTERN_SHAPES.find(s => s.id === myDesignState.patternId);
            if (shape) {
                const generatedValue = shape.generate(myDesignState.patternColor);
                setConfig(prev => ({
                    ...prev,
                    type: 'pattern',
                    value: generatedValue,
                    backgroundColor: myDesignState.bg,
                    spineColor: myDesignState.bg,
                    labelColor: '#1f2937',
                    backgroundSize: shape.size
                }));
            }
        }
    }, [myDesignState, mainTab]);

    // Preset selection handlers
    const selectColor = (color: typeof COVER_COLORS[0]) => {
        setConfig(prev => ({
            ...prev,
            type: 'solid',
            value: color.value,
            spineColor: color.spine,
            labelColor: color.text,
            backgroundColor: undefined, // ✨ Clear bg color
            backgroundSize: undefined // ✨ Clear size
        }));
    };

    const selectPattern = (pattern: typeof COVER_PATTERNS[0]) => {
        setConfig(prev => ({
            ...prev,
            type: 'pattern',
            value: pattern.value,
            spineColor: pattern.spineColor,
            labelColor: pattern.textColor || '#1f2937',
            backgroundColor: pattern.backgroundColor,
            backgroundSize: pattern.size || 'cover' // Default to cover if not specified
        }));
    };

    const selectIllustration = (illu: typeof COVER_ILLUSTRATIONS[0]) => {
        setConfig(prev => ({
            ...prev,
            type: 'illustration',
            value: illu.value,
            spineColor: illu.spineColor,
            labelColor: illu.textColor || '#1f2937',
            backgroundColor: undefined, // ✨ Clear bg color
            backgroundSize: 'cover'
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => ({
                    ...prev,
                    type: 'image',
                    value: '#ffffff', // Fallback
                    customImage: reader.result as string,
                    spineColor: '#e5e7eb', // Default spine for custom images
                    labelColor: '#1f2937'
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Custom Color Handlers
    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        const newConfig = {
            ...config,
            type: 'solid' as const, // Fix type inference
            value: color,
            spineColor: color,
            labelColor: '#1f2937',
            backgroundColor: undefined,
            backgroundSize: undefined
        };
        applyPreset(newConfig);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[800px] border border-gray-100 font-sans">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white z-10 shrink-0">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 p-2 transition -ml-2">
                        <X size={24} />
                    </button>
                    <h2 className="text-gray-800 font-bold text-lg">표지 꾸미기</h2>
                    <div className="flex items-center gap-2 -mr-2">
                        <button
                            onClick={() => onSave(config)}
                            className="text-indigo-600 hover:text-indigo-700 font-bold p-2 transition"
                        >
                            완료
                        </button>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-gray-50 flex items-center justify-center p-8 min-h-[280px] relative overflow-hidden">
                    <div className="w-48 transform hover:scale-105 transition duration-500 z-10">
                        <AlbumBook config={config} title={albumTitle} tag={albumTag} className="shadow-2xl" />
                    </div>
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                </div>

                {/* Controls Area (Panel) */}
                <div className="bg-white rounded-t-[32px] -mt-6 pt-2 pb-6 px-4 flex-1 flex flex-col min-h-[400px] shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] relative z-20 shrink-0 h-[55%]">

                    {/* Main Category Tabs */}
                    <div className="flex justify-center gap-8 border-b border-gray-100 mb-4 shrink-0">
                        <button
                            onClick={() => handleTabChange('design')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${mainTab === 'design' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            디자인
                        </button>
                        <button
                            onClick={() => handleTabChange('my-design')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${mainTab === 'my-design' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            나만의 커스텀
                        </button>
                        <button
                            onClick={() => handleTabChange('sticker')}
                            className={`pb-3 text-sm font-bold transition-all border-b-2 ${mainTab === 'sticker' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            스티커
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="overflow-y-auto flex-1 px-2 custom-scrollbar">

                        {/* 1. Design Tab Content */}
                        {mainTab === 'design' && (
                            <>
                                {/* Sub Tabs (Pulls) */}
                                <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar px-1">
                                    {[
                                        { id: 'color', label: '색상', icon: Palette },
                                        { id: 'pattern', label: '패턴', icon: Layout },
                                        { id: 'illustration', label: '일러스트', icon: Smile }, // Generic icon for art
                                        { id: 'image', label: '사진', icon: ImageIcon }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDesignSubTab(tab.id as any)}
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${designSubTab === tab.id
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
                                        >
                                            {/* <tab.icon size={12} />Icon removed for cleaner look or keep it */}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* PRESETS GRID */}
                                {designSubTab === 'color' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-5 gap-3">
                                            {COVER_COLORS.map(color => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => selectColor(color)}
                                                    className={`aspect-square rounded-full border border-black/5 relative transition-all ${config.value === color.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-lg' : 'hover:scale-105'}`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                            {/* Custom HEX Input Wrapper */}
                                            <div className="aspect-square rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[1px] cursor-pointer group relative overflow-hidden">
                                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center group-hover:bg-opacity-90 transition">
                                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                                        <input
                                                            type="color"
                                                            onChange={handleCustomColorChange}
                                                            className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 opacity-0 cursor-pointer"
                                                        />
                                                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">CUSTOM</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {designSubTab === 'pattern' && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {COVER_PATTERNS.map(pattern => (
                                            <button
                                                key={pattern.id}
                                                onClick={() => selectPattern(pattern)}
                                                className={`aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 relative transition-all group ${config.value === pattern.value ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:-translate-y-1'}`}
                                            >
                                                <div
                                                    className="w-full h-full"
                                                    style={{
                                                        backgroundImage: pattern.value,
                                                        backgroundColor: pattern.backgroundColor || pattern.previewColor,
                                                        backgroundSize: pattern.size || 'cover' // ✨ Apply correct size to thumbnail
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {designSubTab === 'illustration' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {COVER_ILLUSTRATIONS.map(illu => (
                                            <button
                                                key={illu.id}
                                                onClick={() => selectIllustration(illu)}
                                                className={`aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 relative transition-all group ${config.value === illu.value ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:-translate-y-1'}`}
                                            >
                                                <div className="w-full h-full" style={{ backgroundImage: illu.value }} />
                                                <span className="absolute bottom-2 left-2 text-[10px] text-white font-bold drop-shadow-md bg-black/10 backdrop-blur-sm px-2 py-0.5 rounded-full">{illu.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {designSubTab === 'image' && (
                                    <div className="pt-2">
                                        <label className="w-full flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group bg-gray-50/50">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-5 h-5 text-indigo-500" />
                                                </div>
                                                <p className="text-sm text-gray-700 font-bold">사진 업로드하기</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG files supported</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        {config.customImage && (
                                            <div className="mt-4 relative rounded-xl overflow-hidden h-32 w-full border border-gray-200">
                                                <img src={config.customImage} alt="Uploaded" className="w-full h-full object-cover" />
                                                <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                    <Check size={10} /> 사용 중
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* 2. My Design Content (Builder) */}
                        {mainTab === 'my-design' && (
                            <div className="space-y-6 pt-1">
                                {/* Layer 1: Background Color */}
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">1</span>
                                        배경 색상
                                    </h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {[...COVER_COLORS, { name: 'White', value: '#ffffff' }, { name: 'Black', value: '#000000' }].map(color => (
                                            <button
                                                key={color.value}
                                                onClick={() => setMyDesignState(prev => ({ ...prev, bg: color.value }))}
                                                className={`w-9 h-9 rounded-full border border-gray-200 flex-shrink-0 transition ${myDesignState.bg === color.value ? 'ring-2 ring-indigo-500 scale-110 shadow-sm' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color.value }}
                                            />
                                        ))}
                                        {/* Custom BG Picker */}
                                        <div className="w-9 h-9 rounded-full border border-gray-200 flex-shrink-0 overflow-hidden relative shadow-inner">
                                            <input
                                                type="color"
                                                value={myDesignState.bg}
                                                onChange={(e) => setMyDesignState(prev => ({ ...prev, bg: e.target.value }))}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-3 h-3 rounded-full bg-white/30 backdrop-blur-sm border border-white/50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Layer 2: Pattern Shape */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 pl-2">
                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">2</span>
                                        무늬 모양
                                    </h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {PATTERN_SHAPES.map(shape => (
                                            <button
                                                key={shape.id}
                                                onClick={() => setMyDesignState(prev => ({ ...prev, patternId: shape.id }))}
                                                className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${myDesignState.patternId === shape.id
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md ring-1 ring-indigo-200'
                                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm text-gray-500'}`}
                                            >
                                                <div className="w-8 h-8 rounded-lg mb-1.5 border border-black/5 shadow-inner overflow-hidden"
                                                    style={{
                                                        backgroundImage: shape.generate(myDesignState.patternColor),
                                                        backgroundColor: myDesignState.bg
                                                    }}
                                                />
                                                <span className="text-[10px] font-bold">{shape.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Layer 3: Pattern Color */}
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">3</span>
                                        무늬 색상
                                    </h3>
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                        {[{ name: 'Black', value: '#000000' }, { name: 'White', value: '#ffffff' }, ...COVER_COLORS].map(color => (
                                            <button
                                                key={color.value}
                                                onClick={() => setMyDesignState(prev => ({ ...prev, patternColor: color.value }))}
                                                className={`w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0 transition ${myDesignState.patternColor === color.value ? 'ring-2 ring-indigo-500 scale-110 shadow-sm' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color.value }}
                                            />
                                        ))}
                                        {/* Custom Pattern Color Picker */}
                                        <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden relative shadow-inner bg-white">
                                            <input
                                                type="color"
                                                value={myDesignState.patternColor}
                                                onChange={(e) => setMyDesignState(prev => ({ ...prev, patternColor: e.target.value }))}
                                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Sticker Content */}
                        {mainTab === 'sticker' && (
                            <div className="pt-2">
                                <h3 className="text-sm font-bold text-gray-700 mb-4 px-2">스티커 선택</h3>
                                <div className="grid grid-cols-5 gap-3 p-1">
                                    {STICKER_ICONS.map(sticker => (
                                        <button
                                            key={sticker}
                                            onClick={() => setConfig(prev => ({ ...prev, sticker }))}
                                            className={`aspect-square flex items-center justify-center text-2xl rounded-xl transition hover:bg-gray-100 hover:scale-110 ${config.sticker === sticker ? 'bg-indigo-50 ring-2 ring-indigo-500' : ''}`}
                                        >
                                            {sticker}
                                        </button>
                                    ))}
                                    {/* Remove Sticker Button */}
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, sticker: undefined }))}
                                        className="aspect-square flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition border border-dashed border-gray-200"
                                        title="스티커 제거"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 4px;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default CoverCustomizer;
