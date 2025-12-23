

export function WelcomeWidget() {
    return (
        <div className="theme-bg-card theme-border border rounded-2xl p-8 shadow-sm transition-colors duration-300 h-full flex flex-col justify-center">
            <h1 className="text-3xl theme-text-primary mb-2 font-bold">환영합니다!</h1>
            <p className="theme-text-secondary text-lg">
                현재 적용된 테마의 스타일을 확인해보세요.
            </p>
            <div className="flex gap-4 mt-6">
                <button className="theme-btn px-6 py-2 rounded-lg font-medium shadow-sm transition-transform hover:scale-105">
                    Primary
                </button>
                <button className="theme-bg-card theme-border border theme-text-primary px-6 py-2 rounded-lg font-medium hover:bg-black/5 transition-colors">
                    Secondary
                </button>
            </div>
        </div>
    );
}
