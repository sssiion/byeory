import { useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';

const SCROLL_ZONE_SIZE = 150; // Increased zone size as requested
const MAX_SCROLL_SPEED = 15;

export function useAutoScroll() {
    const { isDragging, currentOffset } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getClientOffset(),
    }));

    const reqId = useRef<number | null>(null);

    useEffect(() => {
        if (!isDragging || !currentOffset) {
            cancelScroll();
            return;
        }

        const handleScroll = () => {
            const { y } = currentOffset;
            const winH = window.innerHeight;
            const scrollTop = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - winH;

            let nextScrollY = scrollTop;
            let shouldScroll = false;

            // Scroll Down
            if (y > winH - SCROLL_ZONE_SIZE) {
                const intensity = (y - (winH - SCROLL_ZONE_SIZE)) / SCROLL_ZONE_SIZE;
                const speed = MAX_SCROLL_SPEED * intensity;
                nextScrollY = Math.min(maxScroll, scrollTop + speed);
                shouldScroll = true;
            }
            // Scroll Up
            else if (y < SCROLL_ZONE_SIZE) {
                const intensity = (SCROLL_ZONE_SIZE - y) / SCROLL_ZONE_SIZE;
                const speed = MAX_SCROLL_SPEED * intensity;
                nextScrollY = Math.max(0, scrollTop - speed);
                shouldScroll = true;
            }

            if (shouldScroll) {
                window.scrollTo(0, nextScrollY);
                reqId.current = requestAnimationFrame(handleScroll);
            } else {
                cancelScroll();
            }
        };

        handleScroll();

        return cancelScroll;
    }, [isDragging, currentOffset]);

    function cancelScroll() {
        if (reqId.current) {
            cancelAnimationFrame(reqId.current);
            reqId.current = null;
        }
    }
}
