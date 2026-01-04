import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Prevent Lenis from scrolling when a modal is open
        const observer = new MutationObserver(() => {
            const isModalOpen = document.body.style.overflow === 'hidden' ||
                document.body.hasAttribute('data-radix-scroll-lock');

            if (isModalOpen) {
                lenis.stop();
            } else {
                lenis.start();
            }
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'data-radix-scroll-lock']
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            observer.disconnect();
            lenis.destroy();
        };
    }, []);

    return null;
}
