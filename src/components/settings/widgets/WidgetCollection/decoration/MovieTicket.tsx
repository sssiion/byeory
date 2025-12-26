import { useState } from 'react';
import { Star } from 'lucide-react';
import { WidgetWrapper } from '../Common';

interface MovieTicketProps {
    gridSize?: { w: number; h: number };
}

export function MovieTicket({ gridSize }: MovieTicketProps) {
    const [title, setTitle] = useState(() => localStorage.getItem('movie_title') || '');
    const [date, setDate] = useState(() => localStorage.getItem('movie_date') || '');
    const [rating, setRating] = useState(() => parseInt(localStorage.getItem('movie_rating') || '0'));
    const [isEditing, setIsEditing] = useState(false);

    const w = gridSize?.w || 2;
    // const h = gridSize?.h || 1;
    const isSmall = w === 1;

    const handleSave = () => {
        localStorage.setItem('movie_title', title);
        localStorage.setItem('movie_date', date);
        localStorage.setItem('movie_rating', rating.toString());
        setIsEditing(false);
    };

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-transparent border-none p-0 flex items-center justify-center">
                <div
                    className="w-full h-full bg-[#e3cdab] text-stone-800 rounded-lg relative flex flex-col items-center justify-center p-2 shadow-sm border-l-4 border-dashed border-stone-800/20"
                    onClick={() => setIsEditing(true)}
                >
                    <div className="text-[9px] uppercase tracking-widest font-bold opacity-50 mb-1">ADMIT ONE</div>
                    <div className="font-serif font-bold text-center leading-tight line-clamp-2">{title || 'UNTITLED'}</div>
                    <div className="flex mt-2 gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={8} fill={s <= rating ? 'black' : 'none'} className={s <= rating ? 'text-black' : 'text-black/20'} />
                        ))}
                    </div>
                </div>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-zinc-800 border-none p-4 flex items-center justify-center">
            <div className="relative w-full max-w-sm bg-[#e8dcc5] text-stone-900 rounded-sm shadow-lg flex flex-col sm:flex-row overflow-hidden group">
                {/* Left: Main Ticket Stub */}
                <div className="flex-1 p-4 relative border-r-2 border-dashed border-stone-400">
                    <div className="absolute -right-[7px] top-0 bottom-0 w-[14px] flex flex-col justify-between overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-zinc-800 -mr-2"></div>
                        ))}
                    </div>

                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                className="w-full bg-transparent border-b border-stone-400 font-serif text-lg font-bold placeholder:text-stone-400"
                                placeholder="Movie Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <input
                                type="date"
                                className="w-full bg-transparent border-none text-xs text-stone-600"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <div className="flex gap-1 cursor-pointer">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={20}
                                        fill={s <= rating ? '#1c1917' : 'none'}
                                        className={s <= rating ? 'text-stone-900' : 'text-stone-300'}
                                        onClick={() => setRating(s)}
                                    />
                                ))}
                            </div>
                            <button onClick={handleSave} className="text-[10px] bg-stone-900 text-[#e8dcc5] px-2 py-1 rounded">SAVE</button>
                        </div>
                    ) : (
                        <div onClick={() => setIsEditing(true)} className="cursor-pointer space-y-1">
                            <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">CINEMA TICKET</h3>
                            <h2 className="text-xl font-serif font-black uppercase leading-tight">{title || 'NO TITLE'}</h2>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-xs font-mono">{date || 'YYYY-MM-DD'}</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={12} fill={s <= rating ? '#1c1917' : 'none'} className={s <= rating ? 'text-stone-900' : 'text-stone-300'} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Barcode Stub */}
                <div className="w-12 bg-[#dfd3bc] flex flex-col items-center justify-center py-2 relative">
                    <div className="absolute -left-[7px] top-0 bottom-0 w-[14px] flex flex-col justify-between overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-4 rounded-full bg-zinc-800 -ml-2"></div>
                        ))}
                    </div>
                    <span className="text-[9px] font-mono rotate-90 whitespace-nowrap opacity-60">NO. 0824-2024</span>

                    {/* Barcode visual */}
                    <div className="flex-1 w-6 bg-transparent flex flex-col gap-0.5 py-4 px-1 opacity-70">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="w-full bg-stone-900" style={{ height: Math.random() * 4 + 1 }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
}
