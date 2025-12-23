import React, { useRef } from 'react';
// @ts-ignore
import Draggable from 'react-draggable';
import type { Sticker } from '../types';

interface Props {
    sticker: Sticker;
    isSelected: boolean;
    readOnly: boolean;
    onSelect: () => void;
    onUpdate: (id: string, p: Partial<Sticker>) => void;
    onDelete: (id: string) => void;
}

const StickerItem: React.FC<Props> = ({ sticker, isSelected, onSelect, onUpdate, onDelete, readOnly }) => {
    const nodeRef = useRef(null);

    if (readOnly) {
        return (
            <div className="absolute z-10 pointer-events-none" style={{ left: sticker.x, top: sticker.y, width: sticker.w, height: sticker.h, zIndex: sticker.zIndex, opacity: sticker.opacity }}>
                <div style={{ transform: `rotate(${sticker.rotation}deg)`, width: '100%', height: '100%' }}>
                    <img src={sticker.url} className="w-full h-full object-contain" alt="sticker" />
                </div>
            </div>
        );
    }

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: sticker.x, y: sticker.y }}
            onStart={(e) => { e.stopPropagation(); onSelect(); }}
            onStop={(e, data) => onUpdate(sticker.id, { x: data.x, y: data.y })}
        >
            <div
                ref={nodeRef}
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`absolute cursor-grab group ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                style={{ width: sticker.w, height: sticker.h, zIndex: sticker.zIndex, opacity: sticker.opacity }}
            >
                <div style={{ transform: `rotate(${sticker.rotation}deg)`, width: '100%', height: '100%' }}>
                    <img src={sticker.url} className="w-full h-full object-contain pointer-events-none select-none" alt="sticker" />
                </div>
                {isSelected && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(sticker.id); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-50 cursor-pointer">×</button>
                )}
            </div>
        </Draggable>
    );
};

export default StickerItem;