import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    socialLogin: (token: string) => Promise<boolean>;
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

    const socialLogin = async (token: string) => {
        try {
            const payload = parseJwt(token);
            if (!payload) throw new Error("Invalid token");

            const loginData = {
                email: payload.email,
                provider: "GOOGLE",
                providerId: payload.sub
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
                // Use the existing login logic to update state
                setLoginState(payload.email);
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

            const data = await response.json();

            if (response.ok && data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                setLoginState(email);
                return true;
            } else {
                alert("로그인 실패: " + (data.message || "이메일 또는 비밀번호를 확인하세요."));
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
