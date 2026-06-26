'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, setUserProperties } from '@/lib/analytics';

// Fires a GA4 page_view on every client-side navigation. usePathname /
// useSearchParams change on each App Router route change; gtag's built-in
// pageview only covers full loads, so without this GA4 would see just the
// landing page. Wrapped in Suspense because useSearchParams opts the subtree
// into client rendering.
function PageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        trackPageView();
    }, [pathname, searchParams]);

    return null;
}

// Mounted once in the root layout so it spans the whole app (marketing pages,
// auth, and dashboard alike). Both helpers are no-ops when GA is unconfigured.
export function Analytics() {
    useEffect(() => {
        if (typeof document === 'undefined') return;
        setUserProperties({
            app_locale: document.documentElement.lang,
            app_theme: localStorage.getItem('theme'),
        });
    }, []);

    return (
        <Suspense fallback={null}>
            <PageViewTracker />
        </Suspense>
    );
}
