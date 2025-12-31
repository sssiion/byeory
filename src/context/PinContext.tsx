import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

interface PinContextType {
    isLocked: boolean;
    isPinEnabled: boolean;
    unlock: (pin: string) => Promise<boolean>;
    lock: () => void;
    enablePin: () => Promise<void>;
    disablePin: () => Promise<void>;
    setupPin: (pin: string, password?: string) => Promise<boolean>;
    forgotPin: () => Promise<boolean>;
    verifyResetCode: (code: string) => Promise<boolean>;
    resetPin: (code: string, newPin: string) => Promise<boolean>;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [isLocked, setIsLocked] = useState(false);
    const [isPinEnabled, setIsPinEnabled] = useState(() => {
        return localStorage.getItem('pinEnabled') === 'true';
    });
    const [lastActivity, setLastActivity] = useState(Date.now());

    // NOTE: Backend API URL - Assumed based on plan
    const API_BASE_URL = 'http://localhost:8080/api/auth/pin';

    // 1. Inactivity Timer (15 minutes)
    useEffect(() => {
        if (!isLoggedIn || !isPinEnabled) return;

        const checkInactivity = setInterval(() => {
            if (Date.now() - lastActivity > 15 * 60 * 1000) { // 15 minutes
                if (!isLocked) {
                    setIsLocked(true);
                }
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(checkInactivity);
    }, [isLoggedIn, isPinEnabled, lastActivity, isLocked]);

    // 2. Activity Listener
    useEffect(() => {
        const resetActivity = () => setLastActivity(Date.now());

        // Listen to common user interactions
        window.addEventListener('mousemove', resetActivity);
        window.addEventListener('keydown', resetActivity);
        window.addEventListener('click', resetActivity);
        window.addEventListener('scroll', resetActivity);
        window.addEventListener('touchstart', resetActivity);

        return () => {
            window.removeEventListener('mousemove', resetActivity);
            window.removeEventListener('keydown', resetActivity);
            window.removeEventListener('click', resetActivity);
            window.removeEventListener('scroll', resetActivity);
            window.removeEventListener('touchstart', resetActivity);
        };
    }, []);

    // 3. Initial Lock on Login/Refresh
    useEffect(() => {
        if (isLoggedIn && isPinEnabled) {
            // If just loaded and PIN is enabled, lock immediately (or check session)
            // For security, locking on refresh is safer
            setIsLocked(true);
        }
    }, [isLoggedIn]); // Intentionally not including isPinEnabled to avoid re-locking on toggle

    const unlock = async (pin: string): Promise<boolean> => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(`${API_BASE_URL}/verify`, { pin }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data === true || response.status === 200) {
                setIsLocked(false);
                setLastActivity(Date.now());
                return true;
            }
            return false;
        } catch (error) {
            console.error("PIN verification failed", error);
            // Fallback for Mock/Testing if backend not ready (Remove in production)
            // if (pin === '0000') { setIsLocked(false); return true; }
            return false;
        }
    };

    const lock = useCallback(() => {
        setIsLocked(true);
    }, []);

    const setupPin = async (pin: string, password?: string): Promise<boolean> => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${API_BASE_URL}/setup`, { pin, password }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsPinEnabled(true);
            localStorage.setItem('pinEnabled', 'true');
            return true;
        } catch (error) {
            console.error("PIN setup failed", error);
            return false;
        }
    };

    const forgotPin = async (): Promise<boolean> => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${API_BASE_URL}/forgot`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (error) {
            console.error("Forgot PIN failed", error);
            return false;
        }
    };

    const verifyResetCode = async (code: string): Promise<boolean> => {
        // Mock verification or simple check before final reset
        console.log(`Verifying code: ${code}`);
        return code.length === 6; // Simple validation 
    };

    const resetPin = async (code: string, newPin: string): Promise<boolean> => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${API_BASE_URL}/reset`, { code, newPin }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsLocked(false); // Unlock on success
            setLastActivity(Date.now());
            return true;
        } catch (error) {
            console.error("PIN reset failed", error);
            return false;
        }
    };

    const enablePin = async () => {
        // This state is optimistically updated, usually setupPin handles the actual enablement
        setIsPinEnabled(true);
        localStorage.setItem('pinEnabled', 'true');
    }

    const disablePin = async () => {
        setIsPinEnabled(false);
        setIsLocked(false);
        localStorage.setItem('pinEnabled', 'false');
    }

    return (
        <PinContext.Provider value={{ isLocked, isPinEnabled, unlock, lock, setupPin, enablePin, disablePin, forgotPin, verifyResetCode, resetPin }}>
            {children}
        </PinContext.Provider>
    );
};

export const usePin = () => {
    const context = useContext(PinContext);
    if (context === undefined) {
        throw new Error('usePin must be used within a PinProvider');
    }
    return context;
};
