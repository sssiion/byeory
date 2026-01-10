import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/header/Navigation';
import MarketLayout from '../../components/market/MarketLayout';
import ItemDetailModal from '../../components/market/ItemDetailModal';
import SellModal from '../../components/market/SellModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useCredits } from '../../context/CreditContext';
import { type MarketItem } from '../../types/market';

import { useMarket } from '../../hooks';
import { getMyWidgets } from '../../components/settings/widgets/customwidget/widgetApi';
import { fetchMyPostTemplatesApi, uploadImageToSupabase, fetchPostTemplateById, createPostTemplateApi } from '../../components/post/api';
import { STICKERS } from '../../components/post/constants';

import MarketHeader from '../../components/market/components/MarketHeader';
import MarketTabs from '../../components/market/components/MarketTabs';
import MarketFilterBar from '../../components/market/components/MarketFilterBar';
import MarketHistoryView from '../../components/market/components/MarketHistoryView';
import MarketMyShopView from '../../components/market/components/MarketMyShopView';
import MarketProductGrid from '../../components/market/components/MarketProductGrid';

const Market: React.FC = () => {
    const { credits } = useCredits();
    const navigate = useNavigate();

    const {
        marketItems,
        purchasedItems,
        buyItem,
        getPackPrice,
        sellingItems,
        isWishlisted,
        toggleWishlist,
        registerItem,
        cancelItem,
        isOwned,
        loadMore,
        search,
        hasMore,
        sort,
        filterBySeller,
        sellerId,
        filterByTag,
        selectedTags,
        updateItem,
        totalCount,
        changeSort,
        wishlistItems,
        wishlistDetails,
        filterByCategory,
        filterByFree
    } = useMarket();

    const [activeTab, setActiveTab] = useState<'all' | 'start_pack' | 'sticker' | 'template_widget' | 'template_post' | 'myshop' | 'wishlist' | 'history' | 'free'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [hideOwned, setHideOwned] = useState(false);
    const shouldSkipSearch = React.useRef(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const isFree = activeTab === 'free';
        let category: string = 'all';

        if (['sticker', 'template_widget', 'template_post', 'start_pack'].includes(activeTab)) {
            category = activeTab;
        }

        if (activeTab === 'myshop' || activeTab === 'history') {
            // No fetch needed for feed
        } else if (activeTab === 'wishlist') {
            // Wishlist view
        } else {
            filterByCategory(category);
            filterByFree(isFree);
        }
    }, [activeTab, filterByCategory, filterByFree]);

    // Debounce Search
    useEffect(() => {
        if (shouldSkipSearch.current) {
            shouldSkipSearch.current = false;
            return;
        }

        const timer = setTimeout(() => {
            search(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, search]);

    const [mySellableCandidates, setMySellableCandidates] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const loadMySellableItems = React.useCallback(async () => {
        let apiWidgets: any[] = [];
        let apiTemplates: any[] = [];

        try {
            const [widgets, templates] = await Promise.all([
                getMyWidgets(),
                fetchMyPostTemplatesApi()
            ]);
            apiWidgets = widgets;
            apiTemplates = templates;
        } catch (e) {
            console.error("Failed to load sellable items", e);
        }

        const formattedWidgets = apiWidgets.map(w => ({
            id: w.id || w._id,
            title: w.name,
            type: 'template_widget',
            description: '사용자가 직접 생성한 커스텀 위젯입니다.',
            price: 0,
            source: 'api'
        }));

        const formattedTemplates = apiTemplates
            .filter(t => !t.tags?.includes('acquired'))
            .map(t => ({
                id: t.id,
                title: t.name,
                type: 'template_post',
                description: '사용자가 직접 생성한 게시물 템플릿입니다.',
                price: 0,
                source: 'api',
                originalId: t.id,
                thumbnailUrl: t.thumbnailUrl
            }));

        const allCandidates = [...formattedWidgets, ...formattedTemplates];
        const sellable = allCandidates.filter(candidate => !isOwned(candidate.id))
            .map(candidate => {
                const isAlreadySelling = sellingItems.some(s =>
                    s.referenceId === candidate.id?.toString() &&
                    s.status === 'ON_SALE'
                );
                return { ...candidate, isAlreadySelling };
            });

        setMySellableCandidates(sellable);
    }, [sellingItems, isOwned]);

    useEffect(() => {
        if (activeTab === 'myshop') {
            loadMySellableItems();
        }
    }, [activeTab, loadMySellableItems]);


    const [sellModalItem, setSellModalItem] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const handleBuy = (item: MarketItem) => {
        if (isOwned(item.id)) return;

        const effectivePrice = getPackPrice(item.id, item.price);

        if (credits < effectivePrice) {
            setConfirmation({
                isOpen: true,
                title: '크레딧 부족 😢',
                message: `보유 크레딧이 부족합니다.\n(보유: ${credits.toLocaleString()} C / 필요: ${effectivePrice.toLocaleString()} C)\n\n충전 페이지로 이동하시겠습니까?`,
                type: 'danger',
                singleButton: false,
                onConfirm: () => {
                    setConfirmation(prev => ({ ...prev, isOpen: false }));
                    navigate('/charge');
                }
            });
            return;
        }

        setConfirmation({
            isOpen: true,
            title: '아이템 구매',
            message: `'${item.title}'을(를) ${effectivePrice.toLocaleString()} 크레딧에 \n구매하시겠습니까?`,
            type: 'info',
            singleButton: false,
            onConfirm: async () => {
                setConfirmation(prev => ({ ...prev, isOpen: false }));
                const success = await buyItem(item.id, effectivePrice);

                if (success && ['template_post', 'TEMPLATE_POST'].includes(item.type) && (item as any).referenceId) {
                    try {
                        const original = await fetchPostTemplateById((item as any).referenceId);
                        if (original) {
                            await createPostTemplateApi({
                                name: original.name,
                                paperId: original.paperId || 'default',
                                styles: original.styles,
                                defaultFontColor: original.defaultFontColor,
                                stickers: original.stickers || [],
                                floatingTexts: original.floatingTexts || [],
                                floatingImages: original.floatingImages || [],
                                thumbnailUrl: original.thumbnailUrl,
                                tags: ['acquired']
                            });
                        }
                    } catch (e) {
                        console.error("Failed to clone purchased template", e);
                    }
                }

                setTimeout(() => {
                    if (success) {
                        setConfirmation({
                            isOpen: true,
                            title: '구매 완료! 🎉',
                            message: `'${item.title}' 구매가 완료되었습니다.\n[나의 템플릿] 보관함에 추가되었습니다.`,
                            type: 'success',
                            singleButton: true,
                            onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                        });
                    } else {
                        setConfirmation({
                            isOpen: true,
                            title: '구매 실패',
                            message: '크레딧이 부족하거나 오류가 발생했습니다.',
                            type: 'danger',
                            singleButton: true,
                            onConfirm: () => setConfirmation(prev => ({ ...prev, isOpen: false }))
                        });
                    }
                }, 200);
            }
        });
    };

    const handleSell = (item: any, isEdit: boolean = false) => {
        setSellModalItem(item);
        setIsEditMode(isEdit);
    };

    const handleRegisterSubmit = async (data: { price: number; description: string; tags: string[]; imageFile?: File | null }) => {
        if (!sellModalItem) return;

        let imageUrl = sellModalItem.imageUrl || sellModalItem.thumbnailUrl;

        if (data.imageFile) {
            const uploadedUrl = await uploadImageToSupabase(data.imageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            } else {
                alert("이미지 업로드에 실패했습니다. 기존(또는 기본) 이미지를 사용합니다.");
            }
        }

        if (['template_post', 'TEMPLATE_POST'].includes(sellModalItem.type)) {
            const templateId = isEditMode ? sellModalItem.referenceId : sellModalItem.id;
            const candidate = mySellableCandidates.find(c => String(c.id) === String(templateId));
            if (candidate?.thumbnailUrl) {
                imageUrl = candidate.thumbnailUrl;
            }
        }

        if (isEditMode) {
            const success = await updateItem(sellModalItem.id, {
                ...sellModalItem,
                price: data.price,
                description: data.description,
                tags: data.tags,
                imageUrl: imageUrl
            });

            if (success) {
                alert(`'${sellModalItem.title}' 수정 완료!`);
            }
        } else {
            await registerItem({
                ...sellModalItem,
                price: data.price,
                description: data.description,
                tags: data.tags,
                imageUrl: imageUrl
            });
            alert(`'${sellModalItem.title}'이(가) 등록되었습니다!`);
        }

        setSellModalItem(null);
        setIsEditMode(false);
    };

    const allMarketItems = [...marketItems];

    const filteredItems = useMemo(() => {
        const sourceItems = activeTab === 'wishlist' ? wishlistDetails : allMarketItems;

        return sourceItems.filter((item: any) => {
            if (hideOwned && isOwned(item.id)) return false;

            let matchesTab = false;
            if (activeTab === 'wishlist') {
                matchesTab = true;
            } else if (activeTab === 'history' || activeTab === 'myshop') {
                return false;
            } else if (activeTab === 'all') {
                matchesTab = true;
            } else if (activeTab === 'free') {
                matchesTab = Number(item.price) === 0;
            } else {
                matchesTab = item.type === activeTab;
            }

            if (!matchesTab) return false;

            if (!searchTerm) return true;

            const tags = item.tags || [];
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesSearch;
        });
    }, [allMarketItems, wishlistDetails, activeTab, isWishlisted, searchTerm, hideOwned, isOwned]);

    return (
        <MarketLayout header={<Navigation />}>
            <div className="flex flex-col gap-8 pb-20">
                <MarketHeader />

                <MarketTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {activeTab !== 'myshop' && activeTab !== 'history' && (
                    <MarketFilterBar
                        totalCount={activeTab === 'wishlist' ? wishlistItems.length : totalCount}
                        sellerId={sellerId}
                        filterBySeller={filterBySeller}
                        selectedTags={selectedTags}
                        filterByTag={filterByTag}
                        onClearAll={() => {
                            shouldSkipSearch.current = true;
                            setSearchTerm('');
                            filterByTag(null);
                        }}
                        hideOwned={hideOwned}
                        setHideOwned={setHideOwned}
                        sort={sort}
                        changeSort={changeSort}
                    />
                )}

                {activeTab === 'history' ? (
                    <MarketHistoryView
                        purchasedItems={purchasedItems}
                        setSelectedItem={setSelectedItem}
                    />
                ) : activeTab === 'myshop' ? (
                    <MarketMyShopView
                        sellingItems={sellingItems}
                        mySellableCandidates={mySellableCandidates}
                        handleSell={handleSell}
                        cancelItem={cancelItem}
                    />
                ) : (
                    <MarketProductGrid
                        filteredItems={filteredItems}
                        marketItems={marketItems}
                        purchasedItems={purchasedItems}
                        activeTab={activeTab}
                        onBuy={handleBuy}
                        toggleWishlist={toggleWishlist}
                        isOwned={isOwned}
                        isWishlisted={isWishlisted}
                        setSelectedItem={setSelectedItem}
                        getPackPrice={getPackPrice}
                        hasMore={hasMore}
                        loadMore={loadMore}
                    />
                )}
            </div>

            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onBuy={handleBuy}
                    onToggleWishlist={() => toggleWishlist(selectedItem.id)}
                    isOwned={isOwned(selectedItem.id)}
                    isWishlisted={isWishlisted(selectedItem.id)}
                    effectivePrice={getPackPrice(selectedItem.id, selectedItem.price)}
                    initialTab={selectedItem.initialTab}
                    onFilterBySeller={(id: string) => filterBySeller(id)}
                    onSearchTag={(tag: string) => filterByTag(tag)}
                    reviewTargetId={(() => {
                        const stickerDef = STICKERS.find(s => s.id === selectedItem.referenceId);
                        if (stickerDef && stickerDef.packId) {
                            let packItem = marketItems.find(m => m.referenceId === stickerDef.packId);
                            if (!packItem) {
                                packItem = purchasedItems.find(p => p.referenceId === stickerDef.packId);
                            }
                            if (packItem) return packItem.id;
                        }
                        return undefined;
                    })()}
                />
            )}
            {sellModalItem && (
                <SellModal
                    item={sellModalItem}
                    onClose={() => setSellModalItem(null)}
                    onSubmit={handleRegisterSubmit}
                />
            )}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={confirmation.onConfirm}
                onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                type={confirmation.type || 'info'}
                singleButton={confirmation.singleButton}
                confirmText={confirmation.singleButton ? "확인" : "구매하기"}
            />
        </MarketLayout>
    );
};

export default Market;
