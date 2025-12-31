import React, { createContext, useContext, useState, useEffect } from 'react';

interface PinContextType {
    isLocked: boolean;
    hasPin: boolean;
    isPinEnabled: boolean;
    failedAttempts: number;
    setupPin: (pin: string) => Promise<boolean>;
    verifyPin: (pin: string) => Promise<boolean>;
    verifyLockCode: (code: string) => Promise<boolean>;
    resendLockCode: () => Promise<boolean>;
    togglePin: (enable: boolean) => Promise<boolean>;
    changePin: (pin: string) => Promise<boolean>;
    unlockApp: () => void;
}

const PinContext = createContext<PinContextType | null>(null);

export const usePin = () => {
    const context = useContext(PinContext);
    if (!context) throw new Error('usePin must be used within a PinProvider');
    return context;
};

export const PinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [isPinEnabled, setIsPinEnabled] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());

    // Check PIN status on mount
    useEffect(() => {
        const checkPinStatus = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const res = await fetchWithAuth('/api/pin/status');
                if (res.ok) {
                    const data = await res.json();
                    setHasPin(data.hasPin);
                    setIsPinEnabled(data.isEnabled);
                }
            } catch (error) {
                console.error("Error checking PIN status", error);
            }
        };
        checkPinStatus();
    }, []);

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return new Response(null, { status: 401 });

        try {
            const res = await fetch(`http://localhost:8080${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });
            return res;
        } catch (e) {
            return new Response(null, { status: 500 });
        }
    };

    const setupPin = async (pin: string) => {
        try {
            const res = await fetchWithAuth('/api/pin/setup', {
                method: 'POST',
                body: JSON.stringify({ pin }),
            });
            if (res.ok) {
                setHasPin(true);
                setIsPinEnabled(true);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const verifyPin = async (pin: string) => {
        try {
            const res = await fetchWithAuth('/api/pin/verify', {
                method: 'POST',
                body: JSON.stringify({ pin }),
            });

            if (res.ok) {
                setIsLocked(false);
                setFailedAttempts(0);
                return true;
            } else {
                try {
                    const data = await res.json();
                    if (data && data.remainingAttempts !== undefined) {
                        console.log("Remaining attempts:", data.remainingAttempts);
                    }
                } catch (e) { /* ignore */ }

                setFailedAttempts(prev => prev + 1);
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const verifyLockCode = async (code: string) => {
        try {
            const res = await fetchWithAuth('/api/pin/lock/verify', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            if (res.ok) {
                setIsLocked(false);
                setFailedAttempts(0);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const resendLockCode = async () => {
        try {
            await fetchWithAuth('/api/pin/lock/resend', { method: 'POST' });
            return true;
        } catch (e) {
            return false;
        }
    };

    const togglePin = async (enable: boolean) => {
        try {
            const res = await fetchWithAuth(`/api/pin/toggle?enable=${enable}`, {
                method: 'POST',
            });
            if (res.ok) {
                setIsPinEnabled(enable);
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    const changePin = async (pin: string) => {
        try {
            const res = await fetchWithAuth('/api/pin/change', {
                method: 'POST',
                body: JSON.stringify({ pin }),
            });
            return res.ok;
        } catch (e) {
            return false;
        }
    };

    const unlockApp = () => {
        setIsLocked(false);
        setLastActivityTime(Date.now());
    };

    // Inactivity Timer
    useEffect(() => {
        if (!isPinEnabled || isLocked) return;

        const checkInactivity = () => {
            const now = Date.now();
            if (now - lastActivityTime > 15 * 60 * 1000) { // 15 mins
                setIsLocked(true);
            }
        };

        const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        const updateActivity = () => setLastActivityTime(Date.now());

        activityEvents.forEach(evt => window.addEventListener(evt, updateActivity));
        const timer = setInterval(checkInactivity, 1000);

        return () => {
            activityEvents.forEach(evt => window.removeEventListener(evt, updateActivity));
            clearInterval(timer);
        };
    }, [isPinEnabled, isLocked, lastActivityTime]);

    // Background detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (isPinEnabled) {
                    setIsLocked(true);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isPinEnabled]);

    return (
        <PinContext.Provider value={{
            isLocked, hasPin, isPinEnabled, failedAttempts,
            setupPin, verifyPin, verifyLockCode, resendLockCode, togglePin, changePin, unlockApp
        }}>
            {children}
        </PinContext.Provider>
    );
};
