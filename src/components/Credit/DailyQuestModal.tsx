import React, { useState } from 'react';
import { X, Coins, Check, Clock, PlayCircle, ShoppingBag, PenTool } from 'lucide-react';
import { useCredits, type DailyQuest } from '../../context/CreditContext';
import { useNavigate } from 'react-router-dom';

interface DailyQuestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DailyQuestModal: React.FC<DailyQuestModalProps> = ({ isOpen, onClose }) => {
    const { credits, addCredits, dailyQuests, claimQuest, resetTime } = useCredits();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'quests' | 'shop'>('quests');

    if (!isOpen) return null;

    const handleClaim = (quest: DailyQuest) => {
        if (!quest.isCompleted && quest.isClaimable) {
            claimQuest(quest.id);
        }
    };

    const handleGo = (quest: DailyQuest) => {
        onClose();
        if (quest.type === 'widget') {
            navigate('/home');
        } else if (quest.type === 'post') {
            navigate('/post');
        } else {
            // Default action or specific logic for other types
            navigate('/home');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="theme-bg-modal border theme-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b theme-border theme-bg-header shrink-0">
                    <h2 className="text-xl font-bold theme-text-primary flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        일일 퀘스트
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors theme-text-secondary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Credit Balance & Reset Timer */}
                <div className="bg-[var(--bg-card-secondary)] p-6 flex flex-col items-center justify-center shrink-0">
                    <div className="text-4xl font-black theme-text-primary font-mono mb-2 flex items-center gap-2">
                        <Coins className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
                        {credits.toLocaleString()}
                    </div>
                    <div className="text-xs theme-text-secondary font-medium flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {resetTime} 후 초기화 (KST)
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b theme-border shrink-0">
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'quests' ? 'theme-text-primary border-b-2 border-primary theme-bg-modal' : 'theme-text-secondary bg-[var(--bg-card-secondary)] hover:theme-bg-card'}`}
                        onClick={() => setActiveTab('quests')}
                    >
                        퀘스트 목록
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'shop' ? 'theme-text-primary border-b-2 border-primary theme-bg-modal' : 'theme-text-secondary bg-[var(--bg-card-secondary)] hover:theme-bg-card'}`}
                        onClick={() => setActiveTab('shop')}
                    >
                        크레딧샵
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === 'quests' ? (
                        <div className="space-y-3">
                            {dailyQuests.map((quest) => (
                                <div key={quest.id} className="flex items-center justify-between p-3 rounded-xl border theme-border bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${quest.isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {quest.type === 'login' && <Clock className="w-5 h-5" />}
                                            {quest.type === 'time' && <Clock className="w-5 h-5" />}
                                            {quest.type === 'widget' && <PlayCircle className="w-5 h-5" />}
                                            {quest.type === 'post' && <PenTool className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold theme-text-primary text-sm">{quest.description}</div>
                                            <div className="text-xs theme-text-secondary font-mono">+{quest.reward} C</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {quest.isCompleted ? (
                                            <button disabled className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20 flex items-center gap-1 cursor-default">
                                                <Check className="w-3 h-3" /> 완료
                                            </button>
                                        ) : quest.isClaimable ? (
                                            <button
                                                onClick={() => handleClaim(quest)}
                                                className="px-4 py-1.5 rounded-lg bg-yellow-500 text-white text-xs font-bold shadow-sm hover:bg-yellow-600 active:scale-95 transition-all animate-pulse-soft"
                                            >
                                                받기
                                            </button>
                                        ) : quest.type === 'time' ? (
                                            <button disabled className="px-3 py-1.5 rounded-lg theme-bg-card-secondary theme-text-secondary border theme-border text-xs font-bold cursor-not-allowed opacity-70">
                                                진행 중
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleGo(quest)}
                                                className="px-3 py-1.5 rounded-lg theme-btn border border-primary/30 text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                                            >
                                                이동
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Market Link */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border theme-border flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold theme-text-primary text-sm">아이템 마켓 방문하기</h3>
                                    <p className="text-xs theme-text-secondary mt-1">크레딧으로 스티커와 테마를 구매하세요!</p>
                                </div>
                                <button
                                    onClick={() => { onClose(); navigate('/market'); }}
                                    className="p-2 theme-bg-card rounded-lg border theme-border shadow-sm hover:scale-105 transition-transform"
                                >
                                    <ShoppingBag className="w-5 h-5 text-purple-500" />
                                </button>
                            </div>

                            <div className="border-t theme-border pt-4">
                                <h3 className="text-sm font-bold theme-text-secondary mb-3 uppercase tracking-wider">크레딧 충전</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { amount: 100, price: '₩1,000', color: 'bg-blue-500' },
                                        { amount: 550, price: '₩5,000', color: 'bg-purple-500' },
                                        { amount: 1200, price: '₩10,000', color: 'bg-pink-500', best: true },
                                        { amount: 3000, price: '₩25,000', color: 'bg-yellow-500' },
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (confirm(`${item.price}으로 ${item.amount} 크레딧을 충전하시겠습니까? (테스트 결제)`)) {
                                                    addCredits(item.amount, 'Credit Charge (Test)');
                                                    alert(`${item.amount} 크레딧이 충전되었습니다!`);
                                                }
                                            }}
                                            className="relative group p-3 rounded-xl border theme-border bg-[var(--bg-card)] hover:border-primary/50 transition-all flex flex-col items-center gap-2 text-center"
                                        >
                                            {item.best && (
                                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">BEST</span>
                                            )}
                                            <div className={`w-10 h-10 rounded-full ${item.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Coins className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
                                            </div>
                                            <div>
                                                <div className="font-bold theme-text-primary font-mono">{item.amount} C</div>
                                                <div className="text-xs theme-text-secondary">{item.price}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyQuestModal;
