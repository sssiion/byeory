import React from 'react';

export const MovieSceneConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [3, 2], [3, 3]] as [number, number][],
};

export const MovieScene = React.memo(function MovieScene({ src, quote }: { src: string; quote: string }) {
    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md group border border-gray-800">
            <img src={src} alt="Movie Scene" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-8 pb-2 px-2 text-center">
                <p className="text-white text-xs md:text-sm font-medium font-serif italic drop-shadow-md line-clamp-2">
                    "{quote}"
                </p>
            </div>
        </div>
    );
});
