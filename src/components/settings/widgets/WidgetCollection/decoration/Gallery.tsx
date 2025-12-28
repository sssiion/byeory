import React from 'react';
import { WidgetWrapper } from '../../Shared';

export const PhotoGalleryConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 3], [4, 4]] as [number, number][],
};

// 5. Photo Gallery (내 사진들)
export const PhotoGallery = React.memo(function PhotoGallery({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const images = [
        'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=300&fit=crop'
    ];

    return (
        <WidgetWrapper title="My Gallery">
            <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5 bg-white">
                {images.map((src, i) => (
                    <div key={i} className="relative overflow-hidden group cursor-pointer">
                        <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                    </div>
                ))}
            </div>
        </WidgetWrapper>
    );
});

export const PolaroidConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 2], [2, 2], [2, 3]] as [number, number][],
};

export const Polaroid = React.memo(function Polaroid({ src, date, rotation = 0, gridSize }: { src: string; date: string; rotation?: number; gridSize?: { w: number; h: number } }) {
    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <div
                className="bg-white p-2 pb-6 shadow-lg w-full max-w-[160px] aspect-[4/5] flex flex-col transition-transform hover:scale-105 hover:z-10"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className="w-full aspect-square bg-gray-100 overflow-hidden mb-2 shadow-inner">
                    <img src={src} alt="Polaroid" className="w-full h-full object-cover" />
                </div>
                <div className="text-center mt-auto">
                    <p className="text-gray-400 jua-regular text-[10px] truncate">{date}</p>
                </div>
            </div>
        </div>
    );
});

export const InstantBoothConfig = {
    defaultSize: '1x2',
    validSizes: [[1, 2], [1, 3], [2, 3]] as [number, number][],
};

export const InstantBooth = React.memo(function InstantBooth({ images, date, gridSize }: { images: string[]; date: string; gridSize?: { w: number; h: number } }) {
    return (
        <div className="w-full h-full flex items-center justify-center p-1">
            <div className="h-full max-h-full aspect-[1/2.5] bg-[#1a1a1a] p-1.5 pb-3 shadow-lg flex flex-col gap-1 items-center justify-between overflow-hidden rounded-sm">
                {images.slice(0, 4).map((img, i) => (
                    <div key={i} className="w-full aspect-[3/2] bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src={img} alt={`Cut ${i + 1}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                    </div>
                ))}
                <span className="text-white/50 text-[8px] tracking-widest uppercase shrink-0">{date}</span>
            </div>
        </div>
    );
});

export const FilmStripConfig = {
    defaultSize: '4x2',
    validSizes: [[4, 1], [4, 2]] as [number, number][],
};

export const FilmStrip = React.memo(function FilmStrip({ images, gridSize }: { images: string[]; gridSize?: { w: number; h: number } }) {
    return (
        <div className="relative w-full h-full bg-black p-1 md:p-2 overflow-x-auto scrollbar-hide rounded-lg flex items-center shadow-lg">
            <div className="flex gap-2 min-w-max h-full">
                {images.map((img, i) => (
                    <div key={i} className="relative h-full aspect-[3/2] bg-gray-900 border-y-2 md:border-y-4 border-dashed border-gray-700 flex-shrink-0">
                        <img src={img} alt={`Film ${i}`} className="h-full w-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
});
