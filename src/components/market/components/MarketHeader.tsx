import React from 'react';

const MarketHeader: React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Market</h1>
                <p className="text-[var(--text-secondary)]">
                    나만의 템플릿과 스티커를 거래해보세요.
                </p>
            </div>
        </div>
    );
};

export default MarketHeader;
