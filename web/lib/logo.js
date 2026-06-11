/**
 * Derives a logo URL for a subscription using a cascade of sources:
 *   1. Manually set logoUrl field
 *   2. Clearbit Logo API (high-quality brand logos)
 *   3. DuckDuckGo favicon (reliable fallback for any domain)
 *
 * All sources are external CDNs — nothing is stored in the repo.
 * Requests are made client-side only, no SSRF risk.
 */
export function getLogoSources(subscription) {
    if (subscription.logoUrl) {
        return [subscription.logoUrl];
    }

    if (!subscription.url) return [];

    let domain;
    try {
        domain = new URL(subscription.url).hostname.replace(/^www\./, '');
    } catch {
        return [];
    }

    return [
        `https://logo.clearbit.com/${domain}`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ];
}
