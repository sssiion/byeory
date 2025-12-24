import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (email: string) => void;
    socialLogin: (token: string) => Promise<boolean>;
    logout: () => void;
    user: { email: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        const storedLogin = localStorage.getItem('isLoggedIn');
        const storedEmail = localStorage.getItem('userEmail');
        if (storedLogin === 'true') {
            setIsLoggedIn(true);
            setUser({ email: storedEmail || '' });
        }
    }, []);


    const login = (email: string) => {
        setIsLoggedIn(true);
        setUser({ email });
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
    };

    const socialLogin = async (token: string) => {
        try {
            // Helper to decode JWT payload safely
            const parseJwt = (token: string) => {
                try {
                    return JSON.parse(atob(token.split('.')[1]));
                } catch (e) {
                    return null;
                }
            };

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
                login(payload.email);
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


    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, socialLogin, logout, user }}>
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
