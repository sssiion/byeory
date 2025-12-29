import { WidgetWrapper } from '../Common';

interface ReceiptPrinterProps {
    gridSize?: { w: number; h: number };
}

export const ReceiptPrinterConfig = {
    defaultSize: '2x2',
    validSizes: [[2, 2], [2, 3], [3, 2]] as [number, number][],
};

export function ReceiptPrinter({ gridSize }: ReceiptPrinterProps) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const w = gridSize?.w || 2;
    // const h = gridSize?.h || 1; // Assuming default height is 1 block unit (approx 200px) which is 'Medium' for us, Height 2 is 'Tall'

    // Checking if height is 'tall' (>= 2 rows) is hard without exact props from registry which usually defines 'large' as 2x2.
    // However, draggable widget passes grid W/H.
    const isSmall = w === 1;
    const isWide = w >= 3;
    // We can assume if it's placed in a tall slot manually, but grid unit H is safer.
    const h = gridSize?.h || 1;
    const isTall = h >= 2;

    // Dummy Data simulating a "Day Receipt"
    const TASKS = [
        { id: 1, text: "Wake Up & Hydrate", check: true },
        { id: 2, text: "Morning Yoga", check: true },
        { id: 3, text: "Read 30 mins", check: false },
        { id: 4, text: "Write Implementation", check: true },
        { id: 5, text: "Check Emails", check: false },
        { id: 6, text: "Water Plants", check: false },
        { id: 7, text: "Night Routine", check: false },
    ];

    // Filter tasks based on size
    const displayTasks = isSmall
        ? TASKS.slice(0, 2)
        : (isTall ? TASKS : TASKS.slice(0, 4));

    // Small View: Folded Receipt / Summary
    if (isSmall && !isTall) {
        return (
            <WidgetWrapper className="bg-transparent border-none shadow-none p-0 overflow-visible group flex items-center justify-center">
                <div className="w-full h-auto bg-white text-black font-mono text-[9px] p-2 shadow-md relative rotate-[-2deg] group-hover:rotate-0 transition-transform">
                    <div className="text-center border-b border-black pb-1 mb-1">
                        <span className="font-bold">* MEMO *</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>DONE</span>
                        <span>{TASKS.filter(t => t.check).length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>LEFT</span>
                        <span>{TASKS.filter(t => !t.check).length}</span>
                    </div>
                    <div className="mt-2 text-center text-[7px] opacity-60">
                        KEEP FIGHTING
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-transparent border-none shadow-none p-0 overflow-visible group">
            <div className="relative w-full h-full flex flex-col items-center justify-start pt-1">
                {/* Receipt Paper */}
                <div className="w-full bg-white text-black font-mono text-[10px] p-4 shadow-lg relative transition-transform duration-300 min-h-full">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-4">
                        <h3 className="text-xl font-bold tracking-tighter mb-1 uppercase">* MY DAY *</h3>
                        <p className="text-[8px] opacity-60">USER ID #SJ-2024</p>
                        <p className="text-[8px] opacity-60">{today} {time}</p>
                    </div>

                    <div className="w-full border-t border-dashed border-black/30 my-2"></div>

                    {/* Task List */}
                    <div className="space-y-1 w-full">
                        {displayTasks.map((task, idx) => (
                            <div key={task.id} className="flex justify-between items-start">
                                <span className="flex-1 truncate pr-2 uppercase">
                                    {idx + 1}. {task.text}
                                </span>
                                <span>{task.check ? '[OK]' : '[  ]'}</span>
                            </div>
                        ))}
                        {!isTall && TASKS.length > 4 && (
                            <div className="text-center text-[8px] opacity-50 mt-1">... and {TASKS.length - 4} more</div>
                        )}
                    </div>

                    <div className="w-full border-t border-dashed border-black/30 my-2"></div>

                    <div className="flex justify-between font-bold text-xs">
                        <span>PROGRESS</span>
                        <span>{Math.round((TASKS.filter(t => t.check).length / TASKS.length) * 100)}%</span>
                    </div>

                    {/* Footer (Bar code for Tall/Wide) */}
                    {(isTall || isWide) && (
                        <div className="mt-4 text-center">
                            <p className="text-[8px] mb-2">THANK YOU FOR YOUR EFFORT</p>
                            {/* Simple CSS Barcode */}
                            <div className="h-8 w-3/4 mx-auto flex items-end gap-[2px] justify-center opacity-80">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className={`bg-black h-full`} style={{ width: Math.random() > 0.5 ? '2px' : '4px' }}></div>
                                ))}
                            </div>
                            <p className="text-[7px] mt-1 tracking-[4px]">1234 5678</p>
                        </div>
                    )}

                    {/* Bottom Jagged Edge */}
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-white" style={{
                        maskImage: 'linear-gradient(45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%)',
                        maskSize: '10px 20px',
                        maskRepeat: 'repeat-x',
                        WebkitMaskImage: 'linear-gradient(45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%), linear-gradient(-45deg, transparent 33.33%, #000 33.33%, #000 66.66%, transparent 66.66%)',
                        WebkitMaskSize: '10px 10px',
                        WebkitMaskRepeat: 'repeat-x',
                        background: 'white'
                    }}></div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
