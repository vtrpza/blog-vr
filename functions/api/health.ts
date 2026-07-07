/**
 * GET /api/health
 * Health check endpoint — verifica conectividade com D1.
 */
interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;

  let d1Status: 'ok' | 'error' = 'error';
  try {
    await env.DB.prepare('SELECT 1').first();
    d1Status = 'ok';
  } catch {
    d1Status = 'error';
  }

  return new Response(
    JSON.stringify({
      ok: true,
      version: '0.1.0',
      d1: d1Status,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}