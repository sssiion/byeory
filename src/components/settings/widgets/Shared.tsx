import React from 'react';

interface WidgetWrapperProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    headerRight?: React.ReactNode;
}

export const WidgetWrapper = React.memo(({ children, className = '', style, title, headerRight }: WidgetWrapperProps) => (
    <div className={`widget-wrapper w-full h-full flex flex-col bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] overflow-hidden ${className}`} style={style}>
        {title && (
            <div className="px-3 py-2 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card-secondary)] shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)] truncate">{title}</span>
                {headerRight}
            </div>
        )}
        <div className="flex-1 overflow-hidden relative">
            {children}
        </div>
    </div>
));
