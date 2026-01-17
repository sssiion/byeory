import React, { useEffect } from 'react';

interface NaverLoginButtonProps {
    onSuccess: (data: {
        email: string;
        providerId: string;
        provider: string;
        name?: string;
        nickname?: string;
        profileImage?: string;
        gender?: string;
        birthday?: string;
        birthyear?: string;
        mobile?: string;
    }) => void;
    onError?: () => void;
}

declare global {
    interface Window {
        naver: any;
    }
}

const NaverLoginButton: React.FC<NaverLoginButtonProps> = ({ onSuccess, onError }) => {
    // Add ref to track processing state
    const isProcessed = React.useRef(false);

    useEffect(() => {
        const { naver } = window;
        if (!naver) return;

        // Initialize Naver Login SDK
        const naverLogin = new naver.LoginWithNaverId({
            clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
            callbackUrl: window.location.origin + import.meta.env.BASE_URL + 'login',
            isPopup: false,
            loginButton: { color: "green", type: 3, height: 48 }, // Hidden button logic
            callbackHandle: true
        });

        naverLogin.init();

        // Check login status on load (for callback)
        naverLogin.getLoginStatus(async (status: boolean) => {
            if (status) {
                // Prevent duplicate calls
                if (isProcessed.current) return;
                isProcessed.current = true;

                const user = naverLogin.user;
                const email = user.email || user.getEmail();
                const id = user.id || user.getId();

                if (email && id) {
                    onSuccess({
                        email,
                        providerId: id,
                        provider: 'NAVER',
                        name: user.name,
                        nickname: user.nickname,
                        profileImage: user.profile_image,
                        gender: user.gender,
                        birthday: user.birthday,
                        birthyear: user.birthyear,
                        mobile: user.mobile
                    });
                    // Clean up Naver SDK tokens from localStorage for security
                    localStorage.removeItem('com.naver.nid.access_token');
                    localStorage.removeItem('com.naver.nid.oauth.state_token');
                } else {
                    console.error("Naver login success but missing email or id");
                    if (onError) onError();
                }
            }
        });
    }, [onSuccess, onError]);

    const handleNaverLogin = () => {
        const { naver } = window;
        if (naver && naver.LoginWithNaverId) {
            const loginBtn = document.getElementById('naverIdLogin')?.firstChild as HTMLElement;
            if (loginBtn) {
                loginBtn.click();
            } else {
                console.error("Naver login button not initialized properly");
            }
        }
    };

    return (
        <>
            <div id="naverIdLogin" className="hidden" />
            <button
                type="button"
                onClick={handleNaverLogin}
                className="w-full h-12 rounded-lg border flex items-center justify-center gap-2 transition-all hover:brightness-95 hover:shadow-md active:scale-[0.98] mt-3"
                style={{ backgroundColor: '#03C75A', color: 'white', borderColor: '#03C75A' }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                </svg>
                <span className="font-medium">Naver로 계속하기</span>
            </button>
        </>
    );
};

export default NaverLoginButton;
