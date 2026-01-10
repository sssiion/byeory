import React from 'react';
import { ShoppingBag } from 'lucide-react';
import MerchCard from '../MerchCard';

interface MarketHistoryViewProps {
    purchasedItems: any[];
    setSelectedItem: (item: any) => void;
}

const MarketHistoryView: React.FC<MarketHistoryViewProps> = ({ purchasedItems, setSelectedItem }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
            {purchasedItems.length === 0 ? (
                <div className="col-span-full py-20 text-center text-[var(--text-secondary)] flex flex-col items-center">
                    <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-bold">구매 내역이 없습니다.</p>
                </div>
            ) : (
                purchasedItems.map((item: any) => (
                    <MerchCard
                        key={`history-${item.id}`}
                        item={item}
                        onBuy={() => { }} // No buy action for history
                        isOwned={true}
                        effectivePrice={item.price}
                        onClick={() => setSelectedItem(item)}
                        onClickRating={() => setSelectedItem({ ...item, initialTab: 'reviews' })} // Enable review click
                    />
                ))
            )}
        </div>
    );
};

export default MarketHistoryView;
