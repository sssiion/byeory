import { useState } from 'react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

export const WorryShredderConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 2]] as [number, number][],
};

// --- 1. Worry Shredder (근심 파쇄기) ---
export function WorryShredder({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const [text, setText] = useWidgetStorage('widget-shredder-text', '');
    const [isShredding, setIsShredding] = useState(false);

    const handleShred = () => {
        if (!text) return;
        setIsShredding(true);
        setTimeout(() => {
            setText('');
            setIsShredding(false);
        }, 2000);
    };

    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-gray-800 border-gray-700 flex flex-col items-center justify-center p-1">
                <button
                    onClick={handleShred}
                    disabled={!text || isShredding}
                    className={`w-full h-full flex flex-col items-center justify-center rounded transition-colors ${!text ? 'opacity-50' : 'hover:bg-gray-700'}`}
                >
                    <div className="text-2xl mb-1">{isShredding ? '💥' : '🗑️'}</div>
                    <span className="text-[8px] font-bold text-gray-400">{isShredding ? '...' : (text ? 'SHRED' : 'EMPTY')}</span>
                </button>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-gray-800 border-gray-700">
            <div className="w-full h-full flex flex-col items-center justify-between p-2">
                <div className="w-full text-center text-gray-400 text-xs font-mono mb-2">WORRY SHREDDER</div>

                <div className="relative w-full flex-1 flex flex-col items-center overflow-hidden">
                    {/* Paper Input */}
                    <div
                        className={`w-3/4 bg-white p-2 text-xs text-gray-800 shadow-md transition-all duration-[2000ms] ease-in-out ${isShredding ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'}`}
                        style={{ minHeight: '60px' }}
                    >
                        {isShredding ? (
                            <div className="w-full h-full flex gap-1 overflow-hidden">
                                {/* Shred lines simulation */}
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="flex-1 bg-gray-200 h-full transform translate-y-2"></div>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="w-full h-full resize-none outline-none bg-transparent placeholder:text-gray-300"
                                placeholder="걱정을 입력하세요..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isShredding}
                            />
                        )}
                    </div>

                    {/* Shredder Mouth */}
                    <div className="absolute bottom-0 w-full h-4 bg-black/50 backdrop-blur-sm z-10 border-t-2 border-red-500/50"></div>
                </div>

                <button
                    onClick={handleShred}
                    disabled={!text || isShredding}
                    className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white text-xs font-bold rounded shadow-lg transition-colors"
                >
                    {isShredding ? 'SHREDDING...' : 'DESTROY WORRY'}
                </button>
            </div>
        </WidgetWrapper>
    );
}
