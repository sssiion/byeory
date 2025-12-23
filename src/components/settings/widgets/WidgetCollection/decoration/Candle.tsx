import React from 'react';
import { WidgetWrapper } from '../Common';

export const Candle = React.memo(function Candle() {
    return (
        <WidgetWrapper className="bg-gray-900 border-gray-800">
            <div className="flex flex-col items-center justify-end h-full relative min-h-[60px] w-full">
                <style>{`
          @keyframes flicker {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            25% { transform: scale(0.9, 1.1) skewX(2deg); opacity: 0.8; }
            50% { transform: scale(1.1, 0.9) skewX(-2deg); opacity: 1; }
            75% { transform: scale(0.95, 1.05); opacity: 0.85; }
          }
        `}</style>

                <div
                    className="w-4 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-[50%] absolute top-[20%] blur-[2px]"
                    style={{ animation: 'flicker 1.5s infinite alternate' }}
                >
                    <div className="absolute inset-0 bg-yellow-200 blur-md opacity-40 animate-pulse"></div>
                </div>

                <div className="w-0.5 h-3 bg-black/50 mt-8 mb-1 z-10"></div>

                <div className="w-10 h-16 bg-gradient-to-r from-[#fdfbf7] to-[#e6dfd1] rounded-t-sm shadow-inner relative mt-1">
                    <div className="w-full h-2 bg-gradient-to-r from-[#fdfbf7] to-[#e6dfd1] rounded-[50%] absolute -top-1"></div>
                </div>
            </div>
        </WidgetWrapper>
    );
});
