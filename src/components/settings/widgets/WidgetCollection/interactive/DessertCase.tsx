import { WidgetWrapper } from '../Common';
import { useWidgetStorage } from '../SDK';

// --- 4. Dessert Case (간식 진열대) ---
export const DessertCaseConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 2], [2, 1], [2, 2]] as [number, number][],
};

// --- 4. Dessert Case (간식 진열대) ---
export function DessertCase({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const desserts = ['🍩', '🍪', '🍰', '🧁', '🍮', '🍭', '🍫', '🍦'];
    const [items, setItems] = useWidgetStorage<string[]>('dessert-items', []);

    const addItem = (icon: string) => {
        if (items.length >= 9) return; // Limit
        setItems(prev => [...prev, icon]);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const w = gridSize?.w || 2;
    const h = gridSize?.h || 2;
    const isSmall = w === 1 && h === 1;
    const isTall = w === 1 && h >= 2;
    const isWide = w >= 2 && h === 1;

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
            <div className={`w-full h-full flex ${isWide ? 'flex-row gap-2' : 'flex-col'}`}>
                <div className={`bg-white/50 rounded-lg p-2 flex-1 mb-2 border-2 border-pink-200 border-dashed grid gap-1 
                    ${isTall ? 'grid-cols-2 content-center items-center' : isWide ? 'grid-cols-4 content-center mb-0' : 'grid-cols-3 grid-rows-3'}
                `}>
                    {items.map((item, i) => (
                        <div key={i} onClick={() => removeItem(i)} className="flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform animate-in zoom-in h-full">
                            {item}
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="flex items-center justify-center text-pink-200 text-xs col-span-full">Empty</div>
                    )}
                </div>

                <div className={`flex gap-1 overflow-x-auto scrollbar-hide ${isWide ? 'flex-col overflow-y-auto overflow-x-hidden w-8 pb-0' : 'pb-1'}`}>
                    {desserts.map(d => (
                        <button
                            key={d}
                            onClick={() => addItem(d)}
                            className="min-w-[30px] h-[30px] bg-white rounded-full shadow-sm hover:bg-pink-100 flex items-center justify-center text-sm transition-colors flex-shrink-0"
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
}
