import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface DailyQuest {
    id: string;
    description: string;
    reward: number;
    isCompleted: boolean;
    isClaimable: boolean; // True if formatting condition met but not yet claimed? Or just use isCompleted for claimed state? 
    // Let's simplify: 
    // isCompleted = Claimed and reward received.
    // We need a way to know if it's "Ready to Claim".
    // Let's add 'progress' or 'target' maybe? 
    // For now, simpler: separate 'isCompleted' (claimed) from logic checking readiness.
    type: 'login' | 'time' | 'widget' | 'post';
    targetValue?: number; // e.g., 30 for minutes
}

interface CreditContextType {
    credits: number;
    addCredits: (amount: number, reason?: string) => void;
    spendCredits: (amount: number, reason?: string) => boolean;
    dailyQuests: DailyQuest[];
    claimQuest: (questId: string) => void;
    resetTime: string; // HH:MM:SS until reset
    triggerWidgetInteraction: () => void;
    triggerPostCreation: () => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { sessionStartTime } = useAuth();
    const [credits, setCredits] = useState<number>(() => {
        const saved = localStorage.getItem('user_credits');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [resetTime, setResetTime] = useState<string>('');

    // Helper to get today's date string in KST
    const getKSTDateString = () => {
        return new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Seoul' });
    };

    const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
        const savedQuests = localStorage.getItem('daily_quests');
        const lastQuestDate = localStorage.getItem('last_quest_date');
        const todayKST = getKSTDateString();

        const defaultQuests: DailyQuest[] = [
            { id: 'login', description: '매일 로그인', reward: 5, isCompleted: false, isClaimable: true, type: 'login' },
            { id: 'time_30m', description: '30분 접속 유지', reward: 5, isCompleted: false, isClaimable: false, type: 'time', targetValue: 30 },
            { id: 'time_1h', description: '1시간 접속 유지', reward: 10, isCompleted: false, isClaimable: false, type: 'time', targetValue: 60 },
            { id: 'widget_play', description: '위젯 상호작용하기', reward: 5, isCompleted: false, isClaimable: false, type: 'widget' },
            { id: 'write_post', description: '글 작성하기', reward: 10, isCompleted: false, isClaimable: false, type: 'post' }
        ];

        if (savedQuests && lastQuestDate === todayKST) {
            // Restore state but re-verify "isClaimable" for time quests on load? 
            // Actually, we should merge saved completion state with default definitions in case defaults changed
            const parsed = JSON.parse(savedQuests);
            return defaultQuests.map(def => {
                const saved = parsed.find((p: DailyQuest) => p.id === def.id);
                return saved ? { ...def, isCompleted: saved.isCompleted } : def;
            });
        }
        return defaultQuests;
    });

    useEffect(() => {
        localStorage.setItem('user_credits', credits.toString());
    }, [credits]);

    useEffect(() => {
        const todayKST = getKSTDateString();
        localStorage.setItem('daily_quests', JSON.stringify(dailyQuests));
        localStorage.setItem('last_quest_date', todayKST);
    }, [dailyQuests]);

    // Timer for Reset Time (00:00 KST) and Quest Checks
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const kstOffset = 9 * 60 * 60000;
            const nowKST = new Date(utc + kstOffset);

            // Calculate time until next midnight KST
            const tomorrowKST = new Date(nowKST);
            tomorrowKST.setHours(24, 0, 0, 0);
            const diff = tomorrowKST.getTime() - nowKST.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setResetTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            // Check Time-based Quests
            if (sessionStartTime) {
                const sessionDiff = Date.now() - sessionStartTime;
                const sessionMinutes = Math.floor(sessionDiff / (1000 * 60));

                setDailyQuests(prev => prev.map(q => {
                    if (q.type === 'time' && !q.isCompleted && !q.isClaimable && q.targetValue) {
                        if (sessionMinutes >= q.targetValue) {
                            return { ...q, isClaimable: true };
                        }
                    }
                    return q;
                }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [sessionStartTime]);

    const addCredits = (amount: number, reason?: string) => {
        setCredits(prev => prev + amount);
        console.log(`Added ${amount} credits: ${reason}`);
    };

    const spendCredits = (amount: number, reason?: string) => {
        if (credits >= amount) {
            setCredits(prev => prev - amount);
            console.log(`Spent ${amount} credits: ${reason}`);
            return true;
        }
        return false;
    };

    const claimQuest = (questId: string) => {
        setDailyQuests(prev => {
            const quest = prev.find(q => q.id === questId);
            if (quest && !quest.isCompleted && quest.isClaimable) {
                addCredits(quest.reward, `Quest Claimed: ${quest.description}`);
                return prev.map(q => q.id === questId ? { ...q, isCompleted: true } : q);
            }
            return prev;
        });
    };

    // Auto-enable login quest immediately
    useEffect(() => {
        setDailyQuests(prev => prev.map(q =>
            q.type === 'login' && !q.isCompleted ? { ...q, isClaimable: true } : q
        ));
    }, []);

    // Function to trigger generic widget interaction
    // Can be exposed and called by widgets
    const triggerWidgetInteraction = () => {
        setDailyQuests(prev => prev.map(q => {
            if (q.id === 'widget_play' && !q.isCompleted) {
                return { ...q, isClaimable: true };
            }
            return q;
        }));
    };

    const triggerPostCreation = () => {
        setDailyQuests(prev => prev.map(q => {
            if (q.id === 'write_post' && !q.isCompleted) {
                return { ...q, isClaimable: true };
            }
            return q;
        }));
    };

    return (
        <CreditContext.Provider value={{ credits, addCredits, spendCredits, dailyQuests, claimQuest, resetTime, triggerWidgetInteraction, triggerPostCreation }}>
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

