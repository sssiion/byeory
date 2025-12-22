import React from 'react';

export const NeonSign = React.memo(function NeonSign({ text, color = '#ff00ff' }: { text: string; color?: string }) {
    const glowStyle = {
        textShadow: `
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px ${color},
      0 0 40px ${color},
      0 0 80px ${color}
    `,
        fontFamily: 'cursive',
        color: '#fff'
    };

    return (
        <div className="w-full h-full bg-black/95 rounded-xl border border-gray-800 flex items-center justify-center p-2 overflow-hidden shadow-2xl">
            <h2 className="text-xl md:text-3xl font-bold text-center truncate animate-pulse" style={glowStyle}>
                {text}
            </h2>
        </div>
    );
});
