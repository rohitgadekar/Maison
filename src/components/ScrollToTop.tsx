import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // Disable browser's default scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const scrollToTop = () => {
            // Force immediate scroll to top
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            document.documentElement.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            document.body.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            const root = document.getElementById('root');
            if (root) {
                root.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant'
                });
            }
        };

        scrollToTop();

        // Backup: sometimes layout shifts happen just after render
        const timeoutId = setTimeout(scrollToTop, 0);
        return () => clearTimeout(timeoutId);

    }, [pathname]);

    return null;
};

export default ScrollToTop;
