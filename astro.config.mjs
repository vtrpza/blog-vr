// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://blog.vradvogados.com.br',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      filter: () => true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
