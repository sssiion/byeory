

export function ThemeGuideWidget() {
    return (
        <div className="theme-bg-card-secondary theme-border border rounded-xl p-6 transition-colors duration-300 h-full">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">보조 섹션</h2>
            <p className="theme-text-secondary mb-4 text-sm">
                이 박스는 메인 박스와 구분되는 보조 배경색을 가집니다.
                테마에 따라 투명도나 색상이 달라집니다.
            </p>
            <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-10 rounded-lg theme-bg-card theme-border border flex items-center justify-center text-lg shadow-sm">
                        {i === 1 ? '📦' : i === 2 ? '🎨' : '✨'}
                    </div>
                ))}
            </div>
        </div>
    );
}
