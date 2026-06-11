import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.js');

export default withNextIntl({
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.API_BASE_URL || 'http://localhost:3000'}/:path*`,
            },
        ];
    },
});
