import { useState, useRef } from 'react';
import { Smile, MessageCircle } from 'lucide-react';
import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

interface WorryDollProps {
    gridSize?: { w: number; h: number };
}

export function WorryDoll({ gridSize }: WorryDollProps) {
    const [worry, setWorry] = useState('');
    const [storedWorry, setStoredWorry] = useWidgetStorage<string | null>('widget-worry-doll-val', null);

    const hasWorry = !!storedWorry;
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleGiveWorry = () => {
        if (!worry.trim()) return;
        setStoredWorry(worry);
        setWorry('');
    };

    const handleClearWorry = () => {
        setStoredWorry(null);
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isWide = w >= 2 && h === 1;

    return (
        <WidgetWrapper className="bg-[#fdfbf7] dark:bg-stone-900 border-none p-4 relative overflow-hidden flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] pointer-events-none"></div>

            <div className={`relative z-10 flex ${isWide ? 'flex-row gap-4 items-center w-full' : 'flex-col items-center w-full'}`}>
                {/* The Doll Visual */}
                <div className={`transition-all duration-500 flex-shrink-0 ${isWide ? 'scale-75' : hasWorry ? 'scale-110 mb-2' : 'scale-100 mb-4'}`}>
                    {/* Use a simple SVG composition for the doll */}
                    <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-md">
                        {/* Body */}
                        <rect x="15" y="30" width="30" height="40" rx="4" fill={hasWorry ? "#f97316" : "#fed7aa"} />
                        <path d="M15,30 L45,30 L40,70 L20,70 Z" fill={hasWorry ? "#ea580c" : "#fdba74"} />
                        {/* Head */}
                        <circle cx="30" cy="20" r="14" fill="#ffedd5" stroke="#fb923c" strokeWidth="2" />
                        {/* Eyes */}
                        <circle cx="25" cy="18" r="1.5" fill="#431407" />
                        <circle cx="35" cy="18" r="1.5" fill="#431407" />
                        {/* Mouth */}
                        {hasWorry ? (
                            <path d="M26,24 Q30,28 34,24" stroke="#431407" fill="none" strokeWidth="1.5" />
                        ) : (
                            <path d="M28,24 L32,24" stroke="#431407" strokeWidth="1.5" />
                        )}
                        {/* Arms (holding something?) */}
                        {hasWorry && (
                            <>
                                <path d="M10,40 Q20,50 30,45" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
                                <path d="M50,40 Q40,50 30,45" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
                                <rect x="24" y="38" width="12" height="10" fill="white" stroke="#ccc" transform="rotate(-5 30 43)" />
                            </>
                        )}
                    </svg>
                </div>

                {hasWorry ? (
                    <div className={`text-center animate-fade-in ${isWide ? 'text-left flex-1' : ''}`}>
                        <p className="text-sm text-stone-600 font-medium mb-2 leading-tight">"I'll keep this worry for you."</p>
                        <button
                            onClick={handleClearWorry}
                            className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                        >
                            Thanks, I'm okay
                        </button>
                    </div>
                ) : (
                    <div className={`relative ${isWide ? 'flex-1 h-full' : 'w-full max-w-[200px]'}`}>
                        <textarea
                            ref={inputRef}
                            value={worry}
                            onChange={(e) => setWorry(e.target.value)}
                            placeholder="Tell me your worry..."
                            className={`w-full p-2 text-xs bg-white border border-stone-200 rounded resize-none focus:outline-none focus:border-orange-300 shadow-sm ${isWide ? 'h-20' : 'h-20'}`}
                        />
                        <button
                            onClick={handleGiveWorry}
                            disabled={!worry.trim()}
                            className="absolute bottom-2 right-2 p-1 bg-orange-100 rounded-full text-orange-600 hover:bg-orange-200 disabled:opacity-50 transition-colors"
                        >
                            <MessageCircle size={14} />
                        </button>
                    </div>
                )}
            </div>
        </WidgetWrapper>
    );
}
