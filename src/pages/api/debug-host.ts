export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url }) => {
  return new Response(JSON.stringify({
    url_hostname: url.hostname,
    url_host: url.host,
    header_host: request.headers.get('host'),
    header_x_forwarded_host: request.headers.get('x-forwarded-host'),
    header_x_forwarded_for: request.headers.get('x-forwarded-for'),
    url_origin: url.origin,
    url_href: url.href,
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
