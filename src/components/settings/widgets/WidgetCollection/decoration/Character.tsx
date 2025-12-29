import React from 'react';
import { WidgetWrapper } from '../Common';

export const FavoriteCharacterConfig = {
    defaultSize: '1x1',
    validSizes: [[1, 1], [2, 2]] as [number, number][],
};

export const FavoriteCharacter = React.memo(function FavoriteCharacter({ src, name }: { src: string; name: string; gridSize?: { w: number; h: number } }) {
    return (
        <WidgetWrapper className="bg-gradient-to-br from-pink-50 to-white">
            <div className="relative w-full aspect-square max-w-[100px] rounded-full overflow-hidden border-2 border-[var(--btn-bg)] shadow-md transition-transform hover:scale-105">
                <img src={src} alt={name} className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-xs md:text-sm text-[var(--text-primary)] mt-2 text-center truncate w-full">{name}</span>
        </WidgetWrapper>
    );
});
