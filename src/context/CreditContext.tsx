import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export interface DailyQuest {
    id: string;
    description: string;
    reward: number;
    isCompleted: boolean;
    isClaimable: boolean;
    type: 'login' | 'time' | 'widget' | 'post';
    targetValue?: number;
}

interface CreditContextType {
    userId: string | null;
    credits: number;
    addCredits: (amount: number, reason?: string) => Promise<void>;
    spendCredits: (amount: number, reason?: string) => boolean;
    dailyQuests: DailyQuest[];
    claimQuest: (questId: string) => void;
    resetTime: string;
    triggerWidgetInteraction: () => void;
    triggerPostCreation: () => void;
    refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [credits, setCredits] = useState<number>(0);
    const [resetTime, setResetTime] = useState<string>('');

    // Memoize refreshCredits
    const refreshCredits = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const profile = await response.json();
                if (profile.id) {
                    setUserId(String(profile.id));
                }
                if (profile.credits !== undefined) {
                    setCredits(profile.credits);
                }
            }
        } catch (e) {
            console.error("Failed to fetch credits", e);
        }
    }, []);

    // Helper to get today's date string in KST
    const getKSTDateString = useCallback(() => {
        return new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Seoul' });
    }, []);

    const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
        const savedQuests = localStorage.getItem('daily_quests');
        const lastQuestDate = localStorage.getItem('last_quest_date');
        const todayKST = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Seoul' });

        const defaultQuests: DailyQuest[] = [
            { id: 'login', description: '매일 로그인', reward: 5, isCompleted: false, isClaimable: true, type: 'login' },
            { id: 'time_30m', description: '30분 접속 유지', reward: 5, isCompleted: false, isClaimable: false, type: 'time', targetValue: 30 },
            { id: 'time_1h', description: '1시간 접속 유지', reward: 10, isCompleted: false, isClaimable: false, type: 'time', targetValue: 60 },
            { id: 'widget_play', description: '위젯 상호작용하기', reward: 5, isCompleted: false, isClaimable: false, type: 'widget' },
            { id: 'write_post', description: '글 작성하기', reward: 10, isCompleted: false, isClaimable: false, type: 'post' }
        ];

        if (savedQuests && lastQuestDate === todayKST) {
            const parsed = JSON.parse(savedQuests);
            return defaultQuests.map(def => {
                const saved = parsed.find((p: DailyQuest) => p.id === def.id);
                return saved ? { ...def, isCompleted: saved.isCompleted } : def;
            });
        }
        return defaultQuests;
    });

    useEffect(() => {
        refreshCredits();
    }, [refreshCredits]);

    useEffect(() => {
        const todayKST = getKSTDateString();
        localStorage.setItem('daily_quests', JSON.stringify(dailyQuests));
        localStorage.setItem('last_quest_date', todayKST);
    }, [dailyQuests, getKSTDateString]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const kstOffset = 9 * 60 * 60000;
            const nowKST = new Date(utc + kstOffset);
            const tomorrowKST = new Date(nowKST);
            tomorrowKST.setHours(24, 0, 0, 0);
            const diff = tomorrowKST.getTime() - nowKST.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setResetTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkServerPlayTime = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8080/api/user/playtime', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const totalSeconds = await response.json();
                    const totalMinutes = Math.floor(totalSeconds / 60);
                    setDailyQuests(prev => prev.map(q => {
                        if (q.type === 'time' && !q.isCompleted && !q.isClaimable && q.targetValue) {
                            if (totalMinutes >= q.targetValue) {
                                return { ...q, isClaimable: true };
                            }
                        }
                        return q;
                    }));
                }
            } catch (e) {
                console.error("Failed to check server playtime for quests", e);
            }
        };
        const interval = setInterval(checkServerPlayTime, 60000);
        checkServerPlayTime();
        return () => clearInterval(interval);
    }, []);

    const addCredits = useCallback(async (amount: number, reason?: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        try {
            await fetch('http://localhost:8080/api/credits/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            });
            refreshCredits();
            console.log(`Added ${amount} credits: ${reason}`);
        } catch (e) {
            console.error("Failed to add credits", e);
        }
    }, [refreshCredits]);

    const spendCredits = useCallback((amount: number, reason?: string) => {
        if (credits >= amount) {
            setCredits(prev => prev - amount); // Optimistic update
            // Sync with backend (UserService allows negative addCredits)
            addCredits(-amount, reason || 'Spent credits').catch(e => {
                console.error("Failed to sync spent credits", e);
                refreshCredits();
            });
            return true;
        }
        return false;
    }, [credits, addCredits, refreshCredits]);

    const claimQuest = useCallback((questId: string) => {
        let questToClaim: DailyQuest | undefined;
        setDailyQuests(prev => {
            const quest = prev.find(q => q.id === questId);
            if (quest && !quest.isCompleted && quest.isClaimable) {
                questToClaim = quest;
                return prev.map(q => q.id === questId ? { ...q, isCompleted: true } : q);
            }
            return prev;
        });

        if (questToClaim) {
            addCredits(questToClaim.reward, `Quest Claimed: ${questToClaim.description}`);
        }
    }, [addCredits]);


    // Auto-enable login quest
    useEffect(() => {
        setDailyQuests(prev => prev.map(q =>
            q.type === 'login' && !q.isCompleted ? { ...q, isClaimable: true } : q
        ));
    }, []);

    const triggerWidgetInteraction = useCallback(() => {
        setDailyQuests(prev => prev.map(q => {
            if (q.id === 'widget_play' && !q.isCompleted) {
                return { ...q, isClaimable: true };
            }
            return q;
        }));
    }, []);

    const triggerPostCreation = useCallback(() => {
        setDailyQuests(prev => prev.map(q => {
            if (q.id === 'write_post' && !q.isCompleted) {
                return { ...q, isClaimable: true };
            }
            return q;
        }));
    }, []);

    const contextValue = useMemo(() => ({
        userId,
        credits,
        addCredits,
        spendCredits,
        dailyQuests,
        claimQuest,
        resetTime,
        triggerWidgetInteraction,
        triggerPostCreation,
        refreshCredits
    }), [userId, credits, addCredits, spendCredits, dailyQuests, claimQuest, resetTime, triggerWidgetInteraction, triggerPostCreation, refreshCredits]);

    return (
        <CreditContext.Provider value={contextValue}>
            {children}
        </CreditContext.Provider>
    );
};

export const useCredits = () => {
    const context = useContext(CreditContext);
    if (context === undefined) {
        throw new Error('useCredits must be used within a CreditProvider');
    }
    return context;
};
