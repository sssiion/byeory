import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 p-3 rounded-full bg-[var(--btn-bg)] text-white shadow-lg hover:bg-[var(--btn-bg-hover)] transition-all transform hover:scale-110 z-50 animate-fade-in"
            aria-label="Scroll to top"
        >
            <ArrowUp size={24} />
        </button>
    );
};

export default ScrollToTopButton;
