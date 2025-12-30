import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768) {
    // Initialize with the current window width to avoid hydration mismatch blinking
    // (Assuming client-side only for this project, otherwise checks needed)
    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < breakpoint : false));

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Listener
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, [breakpoint]);

    return isMobile;
}
