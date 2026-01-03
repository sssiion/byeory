import React from 'react';

interface MarketLayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
}

const MarketLayout: React.FC<MarketLayoutProps> = ({ children, header }) => {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
            {header}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MarketLayout;
