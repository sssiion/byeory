import { useState } from 'react';
import { Music } from 'lucide-react';
import { WidgetWrapper } from '../Common';

// --- 11. LP Player (턴테이블)
export function LPPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <WidgetWrapper className="bg-[#2a2a2a] p-3">
            <div className="relative w-full aspect-square flex items-center justify-center">
                <div className={`w-full h-full rounded-full bg-black border-4 border-[#1a1a1a] flex items-center justify-center shadow-xl ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    {/* LP Lines */}
                    <div className="absolute inset-2 rounded-full border border-gray-800 opacity-50"></div>
                    <div className="absolute inset-4 rounded-full border border-gray-800 opacity-50"></div>
                    <div className="absolute inset-6 rounded-full border border-gray-800 opacity-50"></div>

                    {/* Center Label */}
                    <div className="w-1/3 h-1/3 rounded-full bg-yellow-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    </div>
                </div>

                {/* Tone Arm (Simple visual) */}
                <div className={`absolute top-0 right-0 w-1 h-1/2 bg-gray-400 origin-top transition-transform duration-500 ${isPlaying ? 'rotate-12' : 'rotate-[-20deg]'}`}></div>
            </div>

            <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="mt-2 text-white/80 hover:text-white transition-colors"
            >
                {isPlaying ? <div className="w-3 h-3 bg-current rounded-sm" /> : <Music size={14} />}
            </button>
            <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </WidgetWrapper>
    );
}
