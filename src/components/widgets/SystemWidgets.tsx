import React from 'react';


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

export function FeatureCardWidget({ title = "Feature", description, icon }: { title?: string, description?: string, icon?: React.ReactNode }) {
    return (
        <div className="theme-bg-card theme-border border rounded-xl p-6 shadow-sm transition-colors duration-300 h-full flex flex-col">
            <div className="w-10 h-10 rounded-full theme-bg-card-secondary mb-4 flex items-center justify-center theme-text-primary font-bold">
                {icon || '★'}
            </div>
            <h3 className="text-lg font-semibold theme-text-primary mb-2">{title}</h3>
            <p className="theme-text-secondary text-sm flex-1">
                {description || "테마 시스템이 적용된 카드 컴포넌트입니다. 배경색과 텍스트 색상이 자동으로 변경됩니다."}
            </p>
        </div>
    );
}
