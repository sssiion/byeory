import React from 'react';
import { FolderOpen, History } from 'lucide-react';

interface MarketHeaderProps {
    onMyShopClick?: () => void;
    isMyShopActive?: boolean;
    onHistoryClick?: () => void;
    isHistoryActive?: boolean;
}

const MarketHeader: React.FC<MarketHeaderProps> = ({ onMyShopClick, isMyShopActive, onHistoryClick, isHistoryActive }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Market</h1>
                <p className="text-[var(--text-secondary)]">
                    나만의 템플릿과 스티커를 거래해보세요.
                </p>
            </div>
            <div className="flex items-center gap-3">
                {onMyShopClick && (
                    <button
                        onClick={onMyShopClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold ${isMyShopActive
                            ? 'bg-[var(--btn-bg)] text-white shadow-md'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
                            }`}
                    >
                        <FolderOpen size={18} />
                        내 상점
                    </button>
                )}
                {onHistoryClick && (
                    <button
                        onClick={onHistoryClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold ${isHistoryActive
                            ? 'bg-[var(--btn-bg)] text-white shadow-md'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-secondary)]'
                            }`}
                    >
                        <History size={18} />
                        구매 내역
                    </button>
                )}
            </div>
        </div>
    );
};

export default MarketHeader;
