// Umami analytics for the mobile app.
//
// React Native has no DOM, so instead of the web tracker script we POST events
// straight to Umami's collect API (`/api/send`). The event taxonomy mirrors the
// web app (web/lib/analytics.js) so both platforms report the same names; mobile
// traffic is tagged "mobile" and reported under a dedicated hostname.
//
// Configure via build env (eas.json) or mobile/.env:
//   EXPO_PUBLIC_UMAMI_URL         e.g. https://umami.example.com  (Umami host)
//   EXPO_PUBLIC_UMAMI_WEBSITE_ID  the website UUID
//   EXPO_PUBLIC_UMAMI_DOMAIN      optional hostname to report (default app.subscree)
//
// Every helper is a no-op when unconfigured and never throws — analytics must
// never break the app.

import { Platform, Dimensions } from 'react-native';
import { getLocales } from 'expo-localization';
import Constants from 'expo-constants';

const HOST       = process.env.EXPO_PUBLIC_UMAMI_URL;
const WEBSITE_ID = process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID;
const HOSTNAME   = process.env.EXPO_PUBLIC_UMAMI_DOMAIN || 'app.subscree';

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
const USER_AGENT  = `Subscree/${APP_VERSION} (${Platform.OS} ${Platform.Version})`;

const enabled = () => Boolean(HOST && WEBSITE_ID);

// Umami ties events to a "url"; we keep the last tracked screen so custom events
// land on the right page. Also a session cache token returned by Umami, replayed
// on later requests to keep events/identify tied to the same visitor.
let currentUrl  = '/';
let cacheToken  = null;

function screenSize() {
    const { width, height } = Dimensions.get('window');
    return `${Math.round(width)}x${Math.round(height)}`;
}

function language() {
    try { return getLocales()?.[0]?.languageTag || 'en'; } catch { return 'en'; }
}

async function send(type, payload) {
    if (!enabled()) return;
    try {
        const res = await fetch(`${HOST}/api/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': USER_AGENT,
                ...(cacheToken ? { 'x-umami-cache': cacheToken } : {}),
            },
            body: JSON.stringify({
                type,
                payload: {
                    website:  WEBSITE_ID,
                    hostname: HOSTNAME,
                    language: language(),
                    screen:   screenSize(),
                    tag:      'mobile',
                    ...payload,
                },
            }),
        });
        // Umami replies with an opaque session token; reuse it to keep the
        // visitor session stable across events.
        const token = await res.text();
        if (token && token.length < 200 && !/^[[{<]/.test(token)) cacheToken = token;
    } catch {
        /* ignore — analytics must never break the app */
    }
}

// Record a screen view (route name → "/RouteName").
export function trackScreen(name) {
    if (!name) return;
    currentUrl = `/${name}`;
    send('event', { url: currentUrl });
}

// Fire a custom event. `data` is an optional flat object of properties.
export function trackEvent(name, data) {
    if (!name) return;
    send('event', { name, url: currentUrl, ...(data ? { data } : {}) });
}

// Associate the session with a known user (sent on login and app start).
export function identifyUser(id, properties = {}) {
    if (!id) return;
    send('identify', { url: currentUrl, data: { ...properties, userId: String(id) } });
}

// ---------------------------------------------------------------------------
// Shared API-event mapping — kept identical to web/lib/analytics.js so both
// platforms emit the same semantic event names for the same requests.
// ---------------------------------------------------------------------------

const VOCAB = new Set([
    'subscriptions', 'categories', 'payment-methods', 'currencies', 'stats',
    'teams', 'invitations', 'members', 'leave', 'activate', 'accept',
    'auth', 'login', 'register', 'forgot-password', 'reset-password', 'invitation',
    'users', 'me', 'password',
]);

function normalizePath(path) {
    return (
        '/' +
        path
            .split('?')[0]
            .split('/')
            .filter(Boolean)
            .map(seg => (VOCAB.has(seg) ? seg : ':id'))
            .join('/')
    );
}

const EVENTS = {
    'POST /subscriptions': 'subscription_created',
    'PATCH /subscriptions/:id': 'subscription_updated',
    'DELETE /subscriptions/:id': 'subscription_deleted',

    'POST /categories': 'category_created',
    'PATCH /categories/:id': 'category_updated',
    'DELETE /categories/:id': 'category_deleted',

    'POST /payment-methods': 'payment_method_created',
    'PATCH /payment-methods/:id': 'payment_method_updated',
    'DELETE /payment-methods/:id': 'payment_method_deleted',

    'POST /teams': 'team_created',
    'PATCH /teams/:id': 'team_renamed',
    'DELETE /teams/:id': 'team_deleted',
    'POST /teams/:id/activate': 'team_switched',
    'POST /teams/:id/leave': 'team_left',
    'POST /teams/:id/invitations': 'team_member_invited',
    'DELETE /teams/:id/invitations/:id': 'team_invitation_revoked',
    'DELETE /teams/:id/members/:id': 'team_member_removed',
    'POST /teams/invitations/accept': 'team_invitation_accepted',

    'POST /auth/login': 'login',
    'POST /auth/register': 'signup',
    'POST /auth/forgot-password': 'password_forgot_requested',
    'POST /auth/reset-password': 'password_reset',

    'PATCH /users/me': 'profile_updated',
    'PATCH /users/me/password': 'password_changed',
};

export function apiEventName(method, path) {
    return EVENTS[`${method} ${normalizePath(path)}`] ?? null;
}

// Events for which it is safe and useful to attach the set of changed field
// NAMES (never values). Excludes auth/password endpoints whose bodies hold
// credentials.
const FIELD_EVENTS = new Set([
    'subscription_created', 'subscription_updated',
    'category_created', 'category_updated',
    'payment_method_created', 'payment_method_updated',
    'team_created', 'team_renamed', 'team_member_invited',
    'profile_updated',
]);

export function eventDataForBody(eventName, body) {
    if (!FIELD_EVENTS.has(eventName) || !body || typeof body !== 'object') return undefined;
    const fields = Object.keys(body);
    return fields.length ? { fields: fields.join(',') } : undefined;
}
