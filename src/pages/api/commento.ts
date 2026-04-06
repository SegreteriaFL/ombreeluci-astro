import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_NOME = 100;
const MAX_EMAIL = 200;
const MAX_TESTO = 5000;

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = ((locals as any).runtime?.env ?? {}) as Record<string, string>;
  const DIRECTUS_URL = (env.DIRECTUS_URL ?? '').replace(/\/$/, '');
  const DIRECTUS_TOKEN = env.DIRECTUS_TOKEN ?? '';

  if (!DIRECTUS_URL || !DIRECTUS_TOKEN) {
    return json({ ok: false, error: 'Server misconfiguration' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Richiesta non valida' }, 400);
  }

  const { articolo_id, autore_nome, autore_email, testo, hp } =
    body as Record<string, string>;

  // Honeypot anti-spam: campo nascosto deve essere vuoto
  if (hp) {
    return json({ ok: true }, 200);
  }

  if (!articolo_id || typeof articolo_id !== 'string') {
    return json({ ok: false, error: 'Articolo mancante' }, 400);
  }
  if (!autore_nome?.trim() || autore_nome.length > MAX_NOME) {
    return json({ ok: false, error: 'Inserisci il tuo nome (max 100 caratteri)' }, 400);
  }
  if (!autore_email?.trim() || autore_email.length > MAX_EMAIL || !isValidEmail(autore_email)) {
    return json({ ok: false, error: 'Inserisci un indirizzo email valido' }, 400);
  }
  if (!testo?.trim() || testo.trim().length < 10 || testo.length > MAX_TESTO) {
    return json({ ok: false, error: 'Il commento deve essere tra 10 e 5000 caratteri' }, 400);
  }

  const res = await fetch(`${DIRECTUS_URL}/items/commenti`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    },
    body: JSON.stringify({
      articolo: articolo_id,
      autore_nome: autore_nome.trim(),
      autore_email: autore_email.trim().toLowerCase(),
      testo: testo.trim(),
      stato: 'pending',
    }),
  });

  if (!res.ok) {
    console.error('[api/commento] Directus error:', await res.text());
    return json({ ok: false, error: 'Errore interno. Riprova più tardi.' }, 500);
  }

  return json({ ok: true }, 201);
};
