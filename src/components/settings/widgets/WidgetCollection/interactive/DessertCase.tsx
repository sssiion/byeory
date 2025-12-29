import { WidgetWrapper } from '../Common';

// --- 4. Dessert Case (간식 진열대) ---
export const DessertCaseConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 2]] as [number, number][],
};

// --- 4. Dessert Case (간식 진열대) ---
export function DessertCase({ onUpdate, items = [], gridSize }: { onUpdate?: (data: any) => void, items?: string[], gridSize?: { w: number; h: number } }) {
    const desserts = ['🍩', '🍪', '🍰', '🧁', '🍮', '🍭', '🍫', '🍦'];

    const addItem = (icon: string) => {
        if (items.length >= 9) return; // Limit
        if (onUpdate) onUpdate({ items: [...items, icon] });
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        if (onUpdate) onUpdate({ items: newItems });
    };

    const isSmall = (gridSize?.w || 2) < 2;

    if (isSmall) {
        return (
            <WidgetWrapper className="bg-pink-50 border-pink-100 p-1 flex items-center justify-center">
                <button
                    onClick={() => addItem(desserts[Math.floor(Math.random() * desserts.length)])}
                    className="w-full h-full rounded-2xl bg-white border-2 border-dashed border-pink-200 flex flex-col items-center justify-center hover:bg-pink-50 transition-colors"
                >
                    <span className="text-3xl mb-1">{items.length > 0 ? items[items.length - 1] : '🍰'}</span>
                    <span className="text-[10px] text-pink-400 font-bold">{items.length} / 9</span>
                </button>
            </WidgetWrapper>
        );
    }

    return (
        <WidgetWrapper className="bg-pink-50 border-pink-100">
            <div className="w-full h-full flex flex-col">
                <div className="bg-white/50 rounded-lg p-2 flex-1 mb-2 grid grid-cols-3 grid-rows-3 gap-2 border-2 border-pink-200 border-dashed">
                    {items.map((item, i) => (
                        <div key={i} onClick={() => removeItem(i)} className="flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform animate-in zoom-in">
                            {item}
                        </div>
                    ))}
                    {items.length < 9 && (
                        <div className="flex items-center justify-center text-pink-200 text-xs">Empty</div>
                    )}
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {desserts.map(d => (
                        <button
                            key={d}
                            onClick={() => addItem(d)}
                            className="min-w-[30px] h-[30px] bg-white rounded-full shadow-sm hover:bg-pink-100 flex items-center justify-center text-sm transition-colors"
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
}
