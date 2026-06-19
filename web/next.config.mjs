import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

export default withNextIntl({
    output: 'standalone',
    // The /api proxy lives in app/api/[...path]/route.js so the backend URL is
    // resolved at runtime (process.env.API_BASE_URL), not frozen at build time.
});
