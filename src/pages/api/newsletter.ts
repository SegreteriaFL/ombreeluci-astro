/**
 * API endpoint for Mailchimp newsletter subscription.
 * POST /api/newsletter
 * Body: { email: string, lang: 'it' | 'en', source_page: string }
 */
export const prerender = false;

import type { APIRoute } from 'astro';

const MAILCHIMP_SERVER = 'us17';
const MAILCHIMP_LIST_ID = 'efd099264d';

function sanitizeSourcePage(raw: string): string {
  // Remove leading/trailing slashes, replace remaining slashes with dashes
  let clean = raw.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
  // Keep only a-z, 0-9, -
  clean = clean.toLowerCase().replace(/[^a-z0-9-]/g, '');
  // Max 50 chars
  clean = clean.slice(0, 50);
  // Default to 'homepage' if empty
  return clean || 'homepage';
}

function isValidEmail(email: string): boolean {
  // Basic email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request, locals }) => {
  // Parse request body
  let body: { email?: string; lang?: string; source_page?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid_request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { email, lang, source_page } = body;

  // Validate email
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid_email' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get API key from runtime env (CF Workers) or import.meta.env (local/build)
  const apiKey =
    (locals as any)?.runtime?.env?.MAILCHIMP_API_KEY ??
    import.meta.env.MAILCHIMP_API_KEY ??
    '';

  if (!apiKey) {
    console.error('MAILCHIMP_API_KEY not configured');
    return new Response(
      JSON.stringify({ ok: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Prepare Mailchimp request
  const sanitizedSource = sanitizeSourcePage(source_page ?? '');
  const mailchimpUrl = `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  const auth = btoa(`anystring:${apiKey}`);

  const mailchimpBody = {
    email_address: email,
    status: 'pending', // Double opt-in
    language: lang === 'en' ? 'en' : 'it',
    tags: ['website', `page:${sanitizedSource}`],
  };

  try {
    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpBody),
    });

    // Success
    if (response.ok) {
      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle Mailchimp errors
    const errorData = await response.json().catch(() => ({}));

    // Member already exists
    if (response.status === 400 && (errorData as any)?.title === 'Member Exists') {
      return new Response(
        JSON.stringify({ ok: false, error: 'already_subscribed' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Other errors
    console.error('Mailchimp API error:', response.status, errorData);
    return new Response(
      JSON.stringify({ ok: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Mailchimp fetch error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: 'server_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
