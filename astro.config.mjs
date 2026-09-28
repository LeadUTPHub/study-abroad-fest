// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel({
    // El PDF protegido vive en private/ (nunca en public/, CLAUDE.md
    // regla 10) y por eso no se incluye por defecto en el bundle de la
    // función; GET /api/descarga/pdf lo necesita en tiempo de ejecución
    // (PLAN.md, Fase 5).
    includeFiles: ['./private/calendario-becas-saf2026.pdf']
  })
});