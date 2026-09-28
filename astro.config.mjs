// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Dominio final todavía pendiente (PLAN.md, sección 8): sin SITE_URL,
  // las URL absolutas (canonical, Open Graph) se degradan a rutas
  // relativas en vez de inventar un dominio (CLAUDE.md, regla 1). Se
  // activan solas en cuanto se defina SITE_URL en Vercel (Fase 7).
  site: process.env.SITE_URL || undefined,

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