import React, { useEffect } from 'react';
import { EffectController } from './SharedController';
import { Search } from 'lucide-react';

interface ComponentProps {
    className?: string;
    style?: React.CSSProperties;
}

const PortalEffect = () => {
    useEffect(() => {
        // Add a global style when active
        const style = document.createElement('style');
        style.innerHTML = `
            .magnifier-active *:hover {
                transform: scale(1.1);
                z-index: 1000;
                transition: transform 0.2s ease-out;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);
        document.body.classList.add('magnifier-active');

        return () => {
            document.head.removeChild(style);
            document.body.classList.remove('magnifier-active');
        };
    }, []);

    return null;
};

export const Magnifier = ({ className, style }: ComponentProps) => {
    return (
        <EffectController
            className={className}
            style={style}
            label="돋보기"
            icon={<Search size={20} />}
            storageKey="effect-magnifier"
        >
            <PortalEffect />
        </EffectController>
    );
};
