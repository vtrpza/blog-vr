export const prerender = true;

export async function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: https://blog.vradvogados.com.br/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
