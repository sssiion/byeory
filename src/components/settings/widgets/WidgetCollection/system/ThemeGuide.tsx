

export function ThemeGuideWidget({ gridSize }: { gridSize?: { w: number; h: number } }) {
    const isSmall = (gridSize?.w || 2) < 2 && (gridSize?.h || 2) < 2;

    if (isSmall) {
        return (
            <div className="theme-bg-card-secondary theme-border border rounded-xl p-0 flex items-center justify-center h-full shadow-sm">
                <span className="text-2xl">🎨</span>
            </div>
        );
    }
    const isShort = (gridSize?.h || 2) < 2;

    return (
        <div className={`theme-bg-card-secondary theme-border border rounded-xl ${isShort ? 'p-4' : 'p-6'} transition-colors duration-300 h-full flex flex-col justify-between`}>
            <div>
                <h2 className={`font-semibold theme-text-primary ${isShort ? 'text-lg mb-2' : 'text-xl mb-4'}`}>보조 섹션</h2>
                <p className={`theme-text-secondary text-sm ${isShort ? 'line-clamp-1 mb-2' : 'mb-4'}`}>
                    이 박스는 메인 박스와 구분됩니다.
                </p>
            </div>
            <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`rounded-lg theme-bg-card theme-border border flex items-center justify-center shadow-sm ${isShort ? 'h-8 w-8 text-base' : 'h-10 w-10 text-lg'}`}>
                        {i === 1 ? '📦' : i === 2 ? '🎨' : '✨'}
                    </div>
                ))}
            </div>
        </div>
    );
}
