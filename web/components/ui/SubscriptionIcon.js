'use client';

import { useState } from 'react';
import { getLogoSources } from '@/lib/logo';

/**
 * Shows a subscription logo with automatic fallback chain:
 * logoUrl → Clearbit → DuckDuckGo favicon → letter avatar
 */
export function SubscriptionIcon({ subscription, size = 32 }) {
    const sources = getLogoSources(subscription);
    const [index, setIndex] = useState(0);

    const fontSize = Math.round(size * 0.42);
    const letter = subscription.name?.[0]?.toUpperCase() ?? '?';

    const containerStyle = {
        width: size,
        height: size,
        minWidth: size,
        borderRadius: 6,
        overflow: 'hidden',
    };

    if (!sources.length || index >= sources.length) {
        return (
            <div
                style={{ ...containerStyle, fontSize }}
                className="flex items-center justify-center bg-muted text-muted-foreground font-semibold select-none"
                aria-hidden="true"
            >
                {letter}
            </div>
        );
    }

    return (
        <div style={containerStyle} className="flex items-center justify-center bg-muted">
            <img
                src={sources[index]}
                alt=""
                width={size}
                height={size}
                style={{ objectFit: 'contain', width: size, height: size }}
                onError={() => setIndex(i => i + 1)}
            />
        </div>
    );
}
