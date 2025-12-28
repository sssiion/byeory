import { useState } from 'react';
import { Phone, CornerDownLeft } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface PayphoneProps {
    gridSize?: { w: number; h: number };
}

export const PayphoneConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 2]] as [number, number][],
};

export function Payphone({ gridSize }: PayphoneProps) {
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        if (!message.trim()) return;
        setIsSent(true);
        // Simulate sending to "the void"
        setTimeout(() => {
            setMessage('');
            setIsSent(false);
        }, 2000);
    };

    const w = gridSize?.w || 2;
    const isSmall = w === 1;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-red-700 border-red-800 flex items-center justify-center p-2 text-white">
                <Phone size={24} fill="currentColor" className="opacity-90" />
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-[#a31621] dark:bg-[#7a0f18] border-none p-4 relative overflow-hidden flex flex-col">
            {/* Booth Visuals */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-black/20 z-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20 z-10"></div>

            <div className="flex-1 bg-[#daddd8] dark:bg-zinc-300 rounded-lg p-3 shadow-inner flex flex-col relative border-4 border-zinc-400">
                {/* Coin Slot area */}
                <div className="flex items-center justify-between mb-4 border-b-2 border-zinc-400/30 pb-2">
                    <div className="w-1 h-6 bg-black rounded-full"></div>
                    <div className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded shadow-sm border border-zinc-300">INSERT COIN</div>
                    <div className="w-1 h-6 bg-black rounded-full"></div>
                </div>

                {/* Message Screen */}
                <div className="flex-1 bg-[#9ea93f] inner-shadow rounded p-2 mb-2 font-mono text-xs text-black/80 break-words relative overflow-hidden border border-zinc-500">
                    {isSent ? (
                        <div className="absolute inset-0 flex items-center justify-center animate-pulse font-bold">SENT...</div>
                    ) : (
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-full bg-transparent border-none outline-none resize-none placeholder:text-black/30"
                            placeholder="Leave a message..."
                        />
                    )}
                    {/* LCD pixel texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')] opacity-10 pointer-events-none"></div>
                </div>

                {/* Keypad simulation */}
                <div className="text-right">
                    <button
                        onClick={handleSend}
                        disabled={!message || isSent}
                        className="bg-zinc-800 text-white text-[10px] px-3 py-1.5 rounded shadow-lg border-b-2 border-zinc-950 active:border-b-0 active:translate-y-[2px] disabled:opacity-50"
                    >
                        SEND <CornerDownLeft size={8} className="inline ml-1" />
                    </button>
                </div>
            </div>
        </WidgetWrapper>
    );
}
