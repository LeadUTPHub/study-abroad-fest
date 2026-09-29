# Prompt de implementación "Viaje" (Claude Code o Codex)

Antes de pegar: copiar a la raíz del repo `VIAJE.md` y a `design/canvas/` los dos archivos `Viaje-Desktop.dc.html` y `Viaje-Mobile.dc.html`. En Codex, guardar las reglas de CLAUDE.md también como `AGENTS.md` (mismo contenido) para que las lea.

## Prompt principal (pegar completo)

Lee primero CLAUDE.md, PLAN.md y VIAJE.md. VIAJE.md es la especificación de un rediseño visual completo de la landing ("Viaje"). Las referencias visuales son `design/canvas/Viaje-Desktop.dc.html` (1440 px) y `design/canvas/Viaje-Mobile.dc.html` (390 px): son archivos de un canvas de diseño con estilos inline; `{{...}}`, `<sc-for>` y `<sc-if>` son plantillas, no HTML real. Úsalos como referencia de estructura, medidas, colores y animaciones, pero implementa con componentes Astro reales, Tailwind v4 y TypeScript estricto. No copies el HTML tal cual.

Alcance: SOLO diseño. No cambies lógica de canje, cookie, API ni rutas protegidas. Respeta las reglas de CLAUDE.md (sin guiones largos ni cortos, sin aforo, ponentes solo experiencia personal, etc.).

Trabaja en fases, cada una con su commit, y detente al final de cada fase para que yo revise (corre `npm run build` y los tests antes de cada commit):

Fase A, base: mover tokens a `@theme` (colores, fuentes Lilita One, Figtree, IBM Plex Mono, Inter, Archivo), copiar los keyframes del `<style>` de Viaje-Desktop.dc.html a `global.css`, agregar el bloque global de `prefers-reduced-motion`, crear `src/data/schedule.ts` (con Zod) con los datos del cronograma de VIAJE.md sección 4, más datos de ponentes, puertas (stands) y FAQ. Mantén los `// TODO(confirmar)` de los datos pendientes.

Fase B, navbar y footer: componentes `SiteNav.astro` y `SiteFooter.astro` con el diseño de LEAD UTP descrito en VIAJE.md sección 3 (mira `leadutp_website/src/components/layout/Navbar.astro` y `Footer.astro` como referencia visual, solo lectura). Menú móvil accesible.

Fase C, hero y cuenta regresiva: sección `#hero` con nubes, contrail SVG con avión animado, key visual flotante, sello postal, cuenta regresiva (script pequeño, objetivo 2026-10-10T14:00:00-05:00, sin librerías).

Fase D, cronograma: sección `#cronograma` exactamente como VIAJE.md sección 4 (camino grueso con avión animado, grupos numerados, horas muy visibles, carril sticky de stands en desktop, layout apilado en mobile). Lista ordenada semántica con `<time>`. Es la sección que más le importa al cliente: compárala lado a lado con el .dc.html a 1440 y 390 px.

Fase E, ponentes, stands, pasaporte, llegar, CTA final: secciones `#ponentes`, `#stands`, `#calendario`, `#llegar` y CTA de aterrizaje. El botón "Inscríbete" va a https://luma.com/txyuybq9?tk=pwCvrY y "Ya tengo mi código" a la ruta de canje existente. Los 4 sellos del pasaporte son UTP Internacional, EducationUSA, APEBEMO y Migajeando Becas.

Fase F, pulido: animaciones de entrada con IntersectionObserver (una vez), estados hover/focus, revisión de a11y (VIAJE.md sección 8), Lighthouse mobile, búsqueda de `—` y `–` en `src/` (debe dar 0).

Al terminar cada fase muéstrame: qué archivos tocaste, capturas a 1440 y 390 px (Playwright), y qué diferencias quedan contra el diseño. Si algo del diseño choca con una regla de CLAUDE.md o con datos pendientes, avísame antes de decidir.

## Variante corta para Codex (si prefieres una sola tarea por vez)

Lee AGENTS.md, PLAN.md y VIAJE.md. Implementa solo la Fase D (cronograma) de VIAJE.md sección 4 como `src/components/Cronograma.astro`, con datos de `src/data/schedule.ts` validados con Zod, fiel a `design/canvas/Viaje-Desktop.dc.html` y `Viaje-Mobile.dc.html`. No toques nada fuera de ese componente, del archivo de datos y de los estilos globales necesarios. Entrega capturas a 1440 y 390 px y la lista de diferencias.

## Checklist para ti

- Confirmar modalidad de Ivanna y del bloque UC Berkeley, quién presenta MEXT y APEBEMO, nombre exacto "Guillermo Gonzalo".
- Aprobar los títulos de grupos 4 y 5 ("Europa: Erasmus+ y Erasmus Mundus", "Migajeando Becas y cierre").
- Enviar logo del evento y key visual en alta, fotos de ponentes, logos de aliados, URLs de Contacto y Organizan.
