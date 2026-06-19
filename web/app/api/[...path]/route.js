// Runtime proxy to the backend API. The destination is read from
// process.env.API_BASE_URL on every request, so the same built image works
// in any environment without rebuilding (unlike next.config rewrites, whose
// destination is frozen into the build at `next build` time).

// Always run on the Node runtime and never cache — this is a live proxy.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE_URL = (process.env.API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

// Hop-by-hop headers must not be forwarded.
const STRIP_REQUEST_HEADERS = ['host', 'connection', 'content-length'];
const STRIP_RESPONSE_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];

async function proxy(req, ctx) {
    const { path } = await ctx.params;
    const search = new URL(req.url).search;
    const target = `${API_BASE_URL}/${(path ?? []).join('/')}${search}`;

    const headers = new Headers(req.headers);
    STRIP_REQUEST_HEADERS.forEach(h => headers.delete(h));

    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const body = hasBody ? Buffer.from(await req.arrayBuffer()) : undefined;

    let upstream;
    try {
        upstream = await fetch(target, {
            method: req.method,
            headers,
            body: body && body.length ? body : undefined,
            redirect: 'manual',
        });
    } catch {
        return new Response(JSON.stringify({ message: 'Upstream API unreachable' }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }

    const resHeaders = new Headers(upstream.headers);
    STRIP_RESPONSE_HEADERS.forEach(h => resHeaders.delete(h));

    const data = await upstream.arrayBuffer();
    return new Response(data, { status: upstream.status, statusText: upstream.statusText, headers: resHeaders });
}

export {
    proxy as GET,
    proxy as POST,
    proxy as PUT,
    proxy as PATCH,
    proxy as DELETE,
    proxy as OPTIONS,
    proxy as HEAD,
};
