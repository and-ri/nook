const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subscree.app';

export default function sitemap() {
    return [
        { url: siteUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
        { url: `${siteUrl}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
        { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/delete-account`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ];
}
