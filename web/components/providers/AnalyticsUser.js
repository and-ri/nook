'use client';

import { useEffect } from 'react';
import { getMe, updateMe } from '@/lib/api';
import { identifyUser } from '@/lib/analytics';

// Re-associates the Umami session with the logged-in user on every
// authenticated page load (identity from login alone doesn't survive new
// sessions/devices), and keeps the user's timezone in sync so reminders are
// delivered in their local morning. Mounted inside the dashboard layout where a
// token exists.
export function AnalyticsUser() {
    useEffect(() => {
        getMe()
            .then(({ user }) => {
                if (!user) return;
                identifyUser(user.id, { email: user.email, name: user.name });
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tz && tz !== user.timezone) {
                    updateMe({ timezone: tz }).catch(() => { /* transient — retry next load */ });
                }
            })
            .catch(() => { /* unauthenticated or analytics off — ignore */ });
    }, []);

    return null;
}
