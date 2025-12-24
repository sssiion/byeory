import React, { useEffect } from 'react';

interface GoogleLoginButtonProps {
    onSuccess: (credential: string) => void;
    onError?: () => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleCredentialResponse = (response: any) => {
            if (response.credential) {
                onSuccess(response.credential);
            } else {
                if (onError) onError();
            }
        };

        const initializeGoogleSignIn = () => {
            if (window.google && window.google.accounts && containerRef.current) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse
                });

                const width = containerRef.current.offsetWidth;

                window.google.accounts.id.renderButton(
                    containerRef.current,
                    { theme: "outline", size: "large", width: width }
                );
                return true;
            }
            return false;
        };

        if (!initializeGoogleSignIn()) {
            const timer = setInterval(() => {
                if (initializeGoogleSignIn()) {
                    clearInterval(timer);
                }
            }, 100);

            return () => clearInterval(timer);
        }
    }, [onSuccess, onError]);

    return <div id="googleSignInDiv" ref={containerRef} style={{ width: '100%' }}></div>;
};

export default GoogleLoginButton;
