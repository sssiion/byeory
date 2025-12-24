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
    useEffect(() => {
        if (!window.google) {
            console.error("Google script not loaded");
            return;
        }

        const handleCredentialResponse = (response: any) => {
            if (response.credential) {
                onSuccess(response.credential);
            } else {
                if (onError) onError();
            }
        };

        window.google.accounts.id.initialize({
            client_id: "984083865664-j2fgc9nge6t9m83h62er3s6htm9v6or5.apps.googleusercontent.com", // Replace with actual Client ID
            callback: handleCredentialResponse
        });

        window.google.accounts.id.renderButton(
            document.getElementById("googleSignInDiv"),
            { theme: "outline", size: "large" }
        );
    }, [onSuccess, onError]);

    return <div id="googleSignInDiv" style={{ width: '100%' }}></div>;
};

export default GoogleLoginButton;
