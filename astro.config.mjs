// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// `astro dev`/`astro build` nunca cargan `.env` en `process.env` por su
// cuenta (a diferencia de Vercel, que inyecta sus variables de entorno
// directamente): solo exponen las que empiezan con `PUBLIC_` a
// `import.meta.env`. El código de servidor de este proyecto (CANJE_SECRET,
// Upstash, SITE_URL) lee `process.env` directo, así que sin esto nunca
// veía nada de `.env` en local. Mismo mecanismo nativo de Node que ya usan
// los scripts (ver scripts/codigos.ts); en Vercel simplemente no hay
// `.env` que cargar y esto no hace nada.
try {
  process.loadEnvFile();
} catch {
  // Sin .env local (p. ej. en Vercel o en un clon nuevo sin configurar).
}

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