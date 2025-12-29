import React from 'react';

export const FeatureCardConfig = {
    defaultSize: '2x2',
    validSizes: [[1, 1], [2, 1]] as [number, number][],
};

export function FeatureCard({ title = "Feature", description, icon, gridSize: _ }: { title?: string, description?: string, icon?: React.ReactNode, gridSize?: { w: number; h: number } }) {
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
