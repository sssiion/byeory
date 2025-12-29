import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    socialLogin: (tokenOrData: string | { email: string, providerId: string }) => Promise<boolean>;
    localLogin: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    user: { email: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);

    const parseJwt = (token: string) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const payload = parseJwt(token);
            if (payload) {
                setIsLoggedIn(true);
                setUser({ email: payload.email });
            } else {
                localStorage.removeItem('accessToken');
            }
        }

        // Clean up legacy storage if it exists
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    }, []);


    const setLoginState = (email: string) => {
        setIsLoggedIn(true);
        setUser({ email });
    };

    const socialLogin = async (tokenOrData: string | { email: string, providerId: string }) => {
        try {
            let email, providerId;

            if (typeof tokenOrData === 'string') {
                const payload = parseJwt(tokenOrData);
                if (!payload) throw new Error("Invalid token");
                email = payload.email;
                providerId = payload.sub;
            } else {
                email = tokenOrData.email;
                providerId = tokenOrData.providerId;
            }

            const loginData = {
                email,
                provider: "GOOGLE",
                providerId
            };

            const response = await fetch('http://localhost:8080/auth/social-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                // Clear potential stale data first
                localStorage.removeItem('isProfileSetupCompleted');

                // Verify profile status
                try {
                    const profileRes = await fetch('http://localhost:8080/api/user/profile', {
                        headers: { 'Authorization': `Bearer ${data.accessToken}` }
                    });
                    if (profileRes.ok) {
                        localStorage.setItem('isProfileSetupCompleted', 'true');
                    }
                } catch (e) {
                    console.error("Profile check failed", e);
                }

                // Use the existing login logic to update state
                setLoginState(email);
                return true;
            } else {
                console.error("Login failed: No access token received");
                return false;
            }
        } catch (error) {
            console.error("Social login error:", error);
            return false;
        }
    };

    const localLogin = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                    // Clear potential stale data first
                    localStorage.removeItem('isProfileSetupCompleted');

                    // Verify profile status
                    try {
                        const profileRes = await fetch('http://localhost:8080/api/user/profile', {
                            headers: { 'Authorization': `Bearer ${data.accessToken}` }
                        });
                        if (profileRes.ok) {
                            localStorage.setItem('isProfileSetupCompleted', 'true');
                        }
                    } catch (e) {
                        console.error("Profile check failed", e);
                    }

                    setLoginState(email);
                    return true;
                } else {
                    console.error("Login failed: No access token received");
                    alert("로그인 실패: 인증 토큰을 받지 못했습니다.");
                    return false;
                }
            } else if (response.status === 404) {
                alert("가입되지 않은 이메일입니다.");
                return false;
            } else if (response.status === 401) {
                alert("비밀번호가 틀렸습니다.");
                return false;
            } else {
                // Try to parse error message if possible, otherwise use default
                try {
                    const data = await response.json();
                    alert("로그인 실패: " + (data.message || "이메일 또는 비밀번호를 확인하세요."));
                } catch {
                    alert("로그인 실패: 이메일 또는 비밀번호를 확인하세요.");
                }
                return false;
            }
        } catch (error) {
            console.error("Local login error:", error);
            alert("로그인 중 오류가 발생했습니다.");
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

            const response = await fetch('http://localhost:8080/auth/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(joinData),
            });

            if (response.ok) {
                return true;
            } else if (response.status === 409) {
                alert("이미 존재하는 계정입니다.");
                return false;
            } else {
                const data = await response.json().catch(() => ({}));
                alert("회원가입 실패: " + (data.message || "다시 시도해주세요."));
                return false;
            }

        } catch (error) {
            console.error("Signup error:", error);
            alert("회원가입 중 오류가 발생했습니다.");
            return false;
        }
    };


    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isProfileSetupCompleted');
        localStorage.removeItem('userEmail'); // Ensure this is cleared too if used
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, socialLogin, localLogin, signup, logout, user }}>
            {children}
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
