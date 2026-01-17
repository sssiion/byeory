import React, { createContext, useContext, useState, useEffect } from 'react';
import ForcedPinInputModal from '../components/Security/ForcedPinInputModal';
import { authService } from '../services/authService';
import { pinService } from '../services/pinService';

interface AuthContextType {
    isLoggedIn: boolean;
    socialLogin: (tokenOrData: string | {
        email: string;
        providerId: string;
        provider?: string;
        name?: string;
        nickname?: string;
        profileImage?: string;
        gender?: string;
        birthday?: string;
        birthyear?: string;
        mobile?: string;
    }) => Promise<boolean>;
    localLogin: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    user: { email: string } | null;
    sessionStartTime: number | null;
    checkPinStatus: () => Promise<boolean>;
    unlockRequest: () => Promise<string | null>;
    unlockVerify: (code: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const [showPinModal, setShowPinModal] = useState(false);

    const [isPinLocked, setIsPinLocked] = useState(false);

    const triggerPinFlow = async (token: string) => {
        try {
            // 1. Check status first to know if locked
            let locked = false;
            try {
                const status = await authService.checkPinStatus(token);
                locked = status.locked;
            } catch { /* ignore error, assume not locked or handle logically */ }

            // 2. Check if PIN is set
            const isPinSet = await authService.checkPinSet(token);
            if (isPinSet === true) {
                const isVerified = sessionStorage.getItem('pin_verified') === 'true';
                if (!isVerified) {
                    setIsPinLocked(locked);
                    setShowPinModal(true);
                }
            }
        } catch (err) {
            console.error("PIN check failed", err);
        }
    };

    const parseJwt = (token: string) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const payload = parseJwt(token);
                if (payload) {
                    try {
                        // 🌟 Verify token with backend
                        await authService.validateToken(token);

                        setIsLoggedIn(true);
                        setUser({ email: payload.email });

                        const storedStartTime = localStorage.getItem('sessionStartTime');
                        if (storedStartTime) {
                            setSessionStartTime(parseInt(storedStartTime, 10));
                        } else {
                            const now = Date.now();
                            setSessionStartTime(now);
                            localStorage.setItem('sessionStartTime', now.toString());
                        }

                        triggerPinFlow(token);
                    } catch (error) {
                        console.error("Token verification failed:", error);
                        logout(); // Invalid token -> logout
                    }
                } else {
                    logout(); // Malformed token
                }
            } else {
                logout(); // No token
            }
        };

        verifyToken();

        // Clean up legacy storage if it exists
        localStorage.removeItem('userEmail');
    }, []);


    const checkPinStatus = async (): Promise<boolean> => {
        const token = localStorage.getItem('accessToken');
        if (!token) return false;

        try {
            const isPinSet = await authService.checkPinSet(token);
            return isPinSet === true;
        } catch (error) {
            console.error("Failed to check PIN status:", error);
        }
        return false;
    };

    const setLoginState = (email: string) => {
        setIsLoggedIn(true);
        setUser({ email });

        const now = Date.now();
        setSessionStartTime(now);
        localStorage.setItem('sessionStartTime', now.toString());
    };

    const socialLogin = async (tokenOrData: string | {
        email: string,
        providerId: string,
        provider?: string,
        name?: string,
        nickname?: string,
        profileImage?: string,
        gender?: string,
        birthday?: string,
        birthyear?: string;
        mobile?: string;
    }) => {
        // Note: setLoginState is called inside socialLogin which handles the time setting
        try {
            let email: string;
            let providerId: string;
            let provider = "GOOGLE";
            let profileData: any = {};

            if (typeof tokenOrData === 'string') {
                const payload = parseJwt(tokenOrData);
                if (!payload) throw new Error("Invalid token");
                email = payload.email;
                providerId = payload.sub;
            } else {
                email = tokenOrData.email;
                providerId = tokenOrData.providerId;
                if (tokenOrData.provider) provider = tokenOrData.provider;

                // Extract other profile data
                const { name, nickname, profileImage, gender, birthday, birthyear, mobile } = tokenOrData;
                profileData = { name, nickname, profileImage, gender, birthday, birthyear, mobile };
            }

            const loginData = {
                email,
                provider,
                providerId
            };

            const data = await authService.socialLogin(loginData);

            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                // Clear potential stale data first
                localStorage.removeItem('isProfileSetupCompleted');

                // Verify profile status
                try {
                    const isProfileSet = await authService.verifyProfile(data.accessToken);
                    if (isProfileSet) {
                        localStorage.setItem('isProfileSetupCompleted', 'true');
                        // Clear temp profile data if setup is complete
                        localStorage.removeItem('temp_social_profile');
                    } else {
                        // Profile not setup, store the temp profile data
                        if (Object.keys(profileData).length > 0) {
                            localStorage.setItem('temp_social_profile', JSON.stringify(profileData));
                        }
                    }
                } catch (e) {
                    console.error("Profile check failed", e);
                }

                // Use the existing login logic to update state
                setLoginState(email);

                // Initialize PIN flow (checks if locked or set)
                await triggerPinFlow(data.accessToken);

                return true;
            } else {
                console.error("Login failed: No access token received");
                return false;
            }
        } catch (error: any) {
            console.error("Social login error:", error);
            if (error.status) {
                try {
                    const errorText = await error.text();
                    console.error("Error response:", errorText);
                } catch { }
            }
            return false;
        }
    };

    const localLogin = async (email: string, password: string): Promise<boolean> => {
        try {
            const data = await authService.localLogin(email, password);

            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                // Clear potential stale data first
                localStorage.removeItem('isProfileSetupCompleted');

                // Verify profile status
                try {
                    const isProfileSet = await authService.verifyProfile(data.accessToken);
                    if (isProfileSet) {
                        localStorage.setItem('isProfileSetupCompleted', 'true');
                    }
                } catch (e) {
                    console.error("Profile check failed", e);
                }

                setLoginState(email);

                // Initialize PIN flow (checks if locked or set)
                await triggerPinFlow(data.accessToken);

                return true;
            } else {
                alert("로그인 실패: 인증 토큰을 받지 못했습니다.");
                return false;
            }
        } catch (error: any) {
            console.error("Local login error:", error);
            if (error.status === 404) {
                alert("가입되지 않은 이메일입니다.");
            } else if (error.status === 401) {
                alert("비밀번호가 틀렸습니다.");
            } else {
                try {
                    const data = await error.json();
                    alert("로그인 실패: " + (data.message || "이메일 또는 비밀번호를 확인하세요."));
                } catch {
                    alert("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
                }
            }
            return false;
        }
    };

    const signup = async (email: string, password: string): Promise<boolean> => {
        try {
            const joinData = {
                email,
                password,
                provider: "LOCAL"
            };

            await authService.join(joinData);
            return true;

        } catch (error: any) {
            console.error("Signup error:", error);
            if (error.status === 409) {
                alert("이미 존재하는 계정입니다.");
            } else {
                try {
                    const data = await error.json();
                    alert("회원가입 실패: " + (data.message || "다시 시도해주세요."));
                } catch {
                    alert("회원가입 실패: 다시 시도해주세요.");
                }
            }
            return false;
        }
    };


    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        setSessionStartTime(null);
        setShowPinModal(false);
        setIsPinLocked(false);

        // Remove only Auth-related items
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('sessionStartTime');
        localStorage.removeItem('isProfileSetupCompleted');
        localStorage.removeItem('temp_social_profile');
        localStorage.removeItem('my_dashboard_widgets_v3');
        localStorage.removeItem('my_dashboard_grid_size_v4');
        sessionStorage.removeItem('pin_verified'); // Clear PIN verification

        // Clear session specific items
        sessionStorage.removeItem('session_playtime_seconds');
    };

    const handlePinSubmit = async (pin: string): Promise<string | null> => {
        const token = localStorage.getItem('accessToken');
        if (!token) return "로그인이 필요합니다.";

        try {
            try {
                const isCorrect = await pinService.verifyPin(token, pin);
                if (isCorrect === true) {
                    setShowPinModal(false);
                    setIsPinLocked(false);
                    sessionStorage.setItem('pin_verified', 'true'); // Mark as verified for this session
                    return null;
                } else {
                    // Logic flow: backend returns boolean true if correct.
                    // If incorrect, it might throw 400 or just return false? 
                    // Original code assumed fetch OK -> true/false.
                    // New service throws if !ok.
                    return 'PIN 번호가 일치하지 않습니다.';
                }
            } catch (error: any) {
                // Check status if verification failed (likely wrong PIN or locked)
                try {
                    const status = await pinService.getStatus(token);
                    if (status.locked) {
                        setIsPinLocked(true);
                        return `PIN 입력 횟수를 초과하여 계정이 잠겼습니다. (${status.failureCount}/5)`;
                    }
                    if (status.failureCount > 0) {
                        return `PIN 번호가 일치하지 않습니다. (${status.failureCount}/5)`;
                    }
                } catch { }

                return '본인 인증에 실패했습니다.';
            }
        } catch (error) {
            console.error("PIN verification error:", error);
            return "서버 연결 오류가 발생했습니다.";
        }
    };

    const handleUnlockRequest = async (): Promise<string | null> => {
        const token = localStorage.getItem('accessToken');
        if (!token) return "로그인이 필요합니다.";

        try {
            const success = await pinService.requestUnlock(token);
            if (success) {
                return null;
            } else {
                return "인증코드 발송에 실패했습니다.";
            }
        } catch (error) {
            console.error("Unlock request error:", error);
            return "서버 연결 오류가 발생했습니다.";
        }
    };

    const handleEmailCodeSubmit = async (code: string): Promise<string | null> => {
        const token = localStorage.getItem('accessToken');
        if (!token) return "로그인이 필요합니다.";

        try {
            try {
                await pinService.verifyUnlockCode(token, code);
                setShowPinModal(false);
                setIsPinLocked(false);
                sessionStorage.setItem('pin_verified', 'true');
                return null;
            } catch {
                return "유효하지 않은 인증코드입니다.";
            }
        } catch (error) {
            console.error("Unlock verification error:", error);
            return "서버 연결 오류가 발생했습니다.";
        }
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn, socialLogin, localLogin, signup, logout, user, sessionStartTime,
            checkPinStatus, unlockRequest: handleUnlockRequest, unlockVerify: handleEmailCodeSubmit
        }}>
            {children}
            {showPinModal && (
                <ForcedPinInputModal
                    onSubmit={isPinLocked ? handleEmailCodeSubmit : handlePinSubmit}
                    onUnlockRequest={handleUnlockRequest}
                    isLocked={isPinLocked}
                />
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
