import React from 'react';

interface GoogleLoginButtonProps {
    onSuccess: (data: string | { email: string, providerId: string }) => void;
    onError?: () => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {

    const handleGoogleLogin = () => {
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
            console.error("Google script not loaded");
            if (onError) onError();
            return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: async (tokenResponse: any) => {
                if (tokenResponse.access_token) {
                    try {
                        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        });
                        const userInfo = await userInfoResponse.json();
                        onSuccess({ email: userInfo.email, providerId: userInfo.sub });
                    } catch (error) {
                        console.error("Failed to fetch user info", error);
                        if (onError) onError();
                    }
                } else {
                    if (onError) onError();
                }
            },
        });

        client.requestAccessToken();
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-lg border theme-border theme-bg-card theme-text-primary flex items-center justify-center gap-2 transition-all hover:brightness-95 hover:shadow-md active:scale-[0.98]"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span className="font-medium">Google로 계속하기</span>
        </button>
    );
};

export default GoogleLoginButton;
