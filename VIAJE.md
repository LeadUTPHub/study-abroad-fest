# VIAJE.md · Especificación de implementación (diseño "Viaje")

Fuente visual de verdad: `design/canvas/Viaje-Desktop.dc.html` (1440 px) y `design/canvas/Viaje-Mobile.dc.html` (390 px). Son archivos del canvas de diseño: se leen como HTML con estilos inline. `{{x}}` y `<sc-for>`/`<sc-if>` son huecos de plantilla, no HTML real. Sirven de referencia visual y de estructura; NO se copian tal cual al proyecto.

Estado: propuesta aprobada por Carlos Miguel en lo visual. Los datos siguen las reglas de CLAUDE.md (confirmado / propuesto / pendiente).

## 1. Qué se implementa

Reemplazar el diseño actual de la landing por el concepto "Viaje" (un vuelo: Despegue → Ruta → Puertas de embarque → Pasaporte → Aterrizaje), conservando TODA la funcionalidad existente (Luma, canje, cookie, rutas protegidas). Es un cambio de diseño, no de funcionalidad.

Orden de secciones (una sola página `/`):
1. Navbar flotante estilo LEAD UTP
2. `#hero` Despegue
3. `#cronograma` Ruta de vuelo (nombre de sección: "02 · Ruta de vuelo", título "Del despegue al atardecer")
4. `#ponentes` (8 tarjetas tipo pase de abordaje)
5. `#stands` Puertas de embarque (4 puertas + aliados)
6. `#calendario` Pasaporte (pasaporte con sellos animados + tarjeta de código + 3 pasos + CTAs)
7. `#llegar` Pase de abordaje (dirección, mapa, 4 FAQ)
8. CTA final "Tu camino empieza el 10 de octubre" (atardecer, montañas, pista, avión aterrizando)
9. Footer estilo LEAD UTP

Los nombres de sección y títulos NO se cambian.

## 2. Tokens (Tailwind v4 `@theme`)

Marca SAF: sky `#3B99D8`, sky-deep `#2F86C4`, sky-soft `#CFE6F6`, magenta `#AC0BAD`, violet `#6258BB`, paper `#FDFEFC`, paper-2 `#F1F3FA`, road `#525F97`, lav `#ABAEC8`, ink `#1D2152`, ink-2 `#4A507C`. Acento amarillo `#FFE36B` solo en hero, cuenta regresiva, sellos, sol final y detalles nocturnos. NO se usa amarillo en el cronograma.
Navbar/footer (tokens LEAD UTP): navy `#020C3E`, footer bg `#050814`, rojo activo `#D93340`, borde `rgb(255 255 255 / .14)`.
Fuentes: Lilita One (display), Figtree (cuerpo), IBM Plex Mono (etiquetas y horas), Inter + Archivo solo en navbar/footer. Cargar por `<link>` de Google Fonts con `display=swap` o self-host.
Fondo de página: degradado vertical cielo → violeta → noche (ver `background: linear-gradient(...)` de la raíz de cada .dc.html; en producción usar un contenedor con `background` por sección, no un degradado de altura fija en px).

## 3. Navbar y footer (idénticos en espíritu a LEAD UTP)

Navbar: pastilla flotante, 60 px de alto, ancho 1120 px (max), radio 12, borde blanco 14%, fondo `rgba(2,12,62,.78)`, `backdrop-filter: blur(8px) saturate(130%)`, logo LEAD blanco 102 px + separador + wordmark "Study Abroad FEST". Links Inter 13.44 px, activo = fondo blanco 8% + semibold + punto rojo 5 px. CTA blanco con texto navy (Archivo 800, radio 6), hover magenta `#AC0BAD`. Mobile: logo compacto, CTA "Inscríbete", botón hamburguesa con menú (foco atrapado, Escape cierra).
Footer: fondo `#050814`, borde superior blanco 14%, logo 152 px, tagline "LEARN. EXPLORE. ASPIRE. DISCOVER.", redes en círculos 44 px, 4 columnas de links, barra inferior "© 2026 LEAD UTP · Todos los derechos reservados". Referencia exacta del código real: `leadutp_website/src/components/layout/Navbar.astro` y `Footer.astro` (solo lectura, copiar patrón visual, no dependencias).
Pendiente: URLs reales de los links "Contacto" y "Organizan" (hoy placeholders).

## 4. Cronograma (sección más delicada)

Fondo blanco `paper` con borde ondulado (círculos) arriba y abajo. Título en ink, etiqueta en violet.
Estructura desktop: grid `1fr / 300px`.
- Izquierda: camino de papel vertical grueso (84 px, color road `#525F97`, bordes blancos 5 px, línea central discontinua animada `v-dash`), avión grande (escala 2.7, apunta hacia abajo, con sombra) recorriendo el camino en 16 s con `animateMotion`. En producción: SVG inline con `<animateMotion>`, o CSS `offset-path`.
- Por cada grupo: nodo numerado (64 px, degradado magenta → violeta, borde paper 6 px) + tarjeta blanca (borde lav, radio 20) con encabezado (título Lilita 30 px + rango de horas en píldora degradada magenta → violeta con texto blanco, Lilita 23 px) y 3 filas de 56 px.
- Cada fila: hora de inicio en píldora (IBM Plex Mono 21 px, violet sobre `#ECEBF8`) + "a HH:MM" en violet 13 px, título 17 px 800, quién 14 px ink-2, etiqueta de modalidad.
- Extremos: "14:00 Despegue" y "18:00 Atardecer" en píldoras degradadas grandes (Lilita 42 px). Parada punteada con pin para el intermedio.
- Derecha: carril "Stands abiertos" (degradado magenta → violeta, borde paper 6 px), "14:00 → 18:00" en `#CFE6F6`, 4 stands, nota sobre sello de pasaporte. `position: sticky; top: 24px`.
Mobile: mismo camino en 44 px de ancho, tarjetas de 240 px (encabezado 70 + 3 filas de 56), sin carril lateral (los stands van en su sección).
Requisitos: las horas deben ser lo más visible de la tarjeta; jerarquía hora > título > quién. Etiquetas: Presencial `#AC0BAD`, Vlog + Zoom `#2F86C4`, Zoom `#6258BB`, Libre = borde punteado lav.

### Datos del cronograma (mover a `src/data/schedule.ts`, validar con Zod)

```ts
type Mode = 'presencial' | 'vlog-zoom' | 'zoom' | 'libre';
type Row = { start: string; end: string; title: string; who?: string; mode: Mode };
type Group = { n: number; title: string; from: string; to: string; rows: Row[] };
// Intermedio (pin): 15:45 a 15:55 "Intermedio y networking"

export const groups: Group[] = [
  { n: 1, title: 'Bienvenida y voces internacionales', from: '14:00', to: '14:35', rows: [
    { start: '14:00', end: '14:10', title: 'Bienvenida', who: 'LEAD UTP', mode: 'presencial' },
    { start: '14:10', end: '14:15', title: 'Cápsula', who: 'Fernando Injoque (Purdue)', mode: 'vlog-zoom' },
    { start: '14:15', end: '14:35', title: 'Ponencia', who: 'Ivanna (Purdue)', mode: 'vlog-zoom' } ] },
  { n: 2, title: 'Conferencia, panel y Fulbright', from: '14:35', to: '15:45', rows: [
    { start: '14:35', end: '14:55', title: 'Conferencia: convenios, requisitos y movilidad', who: 'UTP Internacional', mode: 'presencial' },
    { start: '14:55', end: '15:25', title: 'Panel de ex-becarios', who: 'Leslie Sánchez, Diego Mendoza (UC Berkeley)', mode: 'presencial' },
    { start: '15:25', end: '15:45', title: 'Beca Fulbright', who: 'EducationUSA', mode: 'presencial' } ] },
  { n: 3, title: 'Japón: Beca MEXT con APEBEMO', from: '15:55', to: '16:40', rows: [
    { start: '15:55', end: '16:00', title: 'Cápsula', who: 'Mila (Japón)', mode: 'vlog-zoom' },
    { start: '16:00', end: '16:20', title: 'Beca MEXT', who: 'APEBEMO', mode: 'presencial' },
    { start: '16:20', end: '16:40', title: 'APEBEMO', mode: 'presencial' } ] },
  { n: 4, title: 'Europa: Erasmus+ y Erasmus Mundus', from: '16:40', to: '17:20', rows: [
    { start: '16:40', end: '16:45', title: 'Cápsula', who: 'Guillermo Gonzalo (Erasmus+)', mode: 'vlog-zoom' },
    { start: '16:45', end: '17:05', title: 'Erasmus Mundus', who: 'EMA Perú', mode: 'presencial' },
    { start: '17:05', end: '17:20', title: 'Conexión Erasmus Mundus', who: 'Raquel Sánchez', mode: 'zoom' } ] },
  { n: 5, title: 'Migajeando Becas y cierre', from: '17:20', to: '18:00', rows: [
    { start: '17:20', end: '17:40', title: 'Migajeando Becas', who: 'Raúl Jauregui', mode: 'presencial' },
    { start: '17:40', end: '17:55', title: 'Networking y mesas de consulta', mode: 'libre' },
    { start: '17:55', end: '18:00', title: 'Cierre', who: 'LEAD UTP', mode: 'presencial' } ] },
];
```
Estado de los datos:
- CONFIRMADO: horas y actividades del cronograma 14:00 a 18:00 (tabla "Actualización del horario").
- PROPUESTO por diseño: los títulos de los grupos 4 y 5, y las etiquetas de modalidad.
- PENDIENTE de confirmar: modalidad de Ivanna y del bloque UC Berkeley; quién presenta Beca MEXT y APEBEMO; "Guillermo Gonzalo" vs "Guillermo Alfaro"; si Carmen (Tec de Monterrey) y Lizbeth Dávila (ELAP · SIAS) siguen. No mostrar en la web nada que dependa de estos pendientes sin marcarlo en el código con `// TODO(confirmar)`.
Las charlas internacionales son siempre "vlog pregrabado + preguntas en vivo por Zoom", nunca "presencial".

## 5. Animaciones (catálogo)

Todas con CSS keyframes o SVG animateMotion. Todas se desactivan con `prefers-reduced-motion: reduce` (mostrar estado final). Nunca animar propiedades de layout; solo `transform` y `opacity`.
- `v-drift` nubes a la deriva (11 s / 15 s alternate), `v-float` tarjeta del key visual (7 s), `v-spin` sello postal giratorio (26 s), `v-dash` líneas discontinuas (1.4 s linear), contrail SVG del hero con avión `animateMotion` 14 s, `v-twinkle` estrellas (3 s), `v-sun` pulso del sol (5 s).
- `v-flip` píldoras de hora al entrar (0.7 s, escalonado 0.09 s), `v-pop` entrada de tarjetas (0.8 s), `v-live` punto en vivo (2 s), `v-tickn` dígitos de la cuenta regresiva.
- `v-stamp` 4 sellos que caen sobre el pasaporte en bucle de 8 s, `v-btn` brillo diagonal + elevación en hover, `v-gate`/`v-tag` levitación en hover de puertas y tarjetas de ponente, `v-stop` desplazamiento 6 px en hover de filas.
Los keyframes exactos están en el `<style>` dentro de `<helmet>` de `Viaje-Desktop.dc.html`; copiar tal cual a un `<style>` global o a `global.css`.
Activar las animaciones de entrada con `IntersectionObserver` (una vez), no todas al cargar.

## 6. Cuenta regresiva

Objetivo `2026-10-10T14:00:00-05:00`, formato días / horas / minutos, se actualiza cada 30 s, se detiene en 00 al llegar. Tras esa hora, cambiar el texto del hero a "Ya estamos en vuelo" (propuesta, confirmar).

## 7. Responsive

Breakpoints: mobile 390 (diseño base), tablet intermedio a 768, desktop 1440. Contenedor máximo 1200 px con 120 px de margen lateral en desktop. El cronograma en <1024 px usa el layout mobile (sin carril lateral). Objetivos táctiles ≥44 px. Sin scroll horizontal.

## 8. Accesibilidad

Contraste AA mínimo (el texto blanco sobre violeta/magenta cumple; verificar píldoras violet sobre `#ECEBF8`). `lang="es"`. Camino, nubes, sellos y avión son decorativos: `aria-hidden`. El cronograma es una lista ordenada semántica (`<ol>` de grupos, `<ul>` de filas) con `<time>` en cada hora. Foco visible 3 px violet. Menú móvil con `aria-expanded`. Sin información solo por color: cada etiqueta de modalidad lleva texto.

## 9. Reglas que NO se tocan

Las 8 reglas de CLAUDE.md siguen vigentes: sin guiones largos ni cortos (usar puntos, comas, dos puntos o "·"; en horas usar "a" o "→"); nunca mostrar aforo; los ponentes comparten solo experiencia personal (lo oficial se atiende en los stands); Embajada de Japón no aparece como stand ni organizador; el brochure no es fuente de verdad; contenido protegido del calendario solo tras la cookie de canje; códigos en texto plano jamás en el repo.

## 10. Criterios de aceptación

1. Fidelidad visual: comparar lado a lado con los .dc.html a 1440 y 390 px; diferencias ≤ 4 px en espaciados clave.
2. Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 en mobile.
3. CLS ≈ 0 (reservar tamaños de imágenes y fuentes).
4. Cero errores de `astro check` y TypeScript estricto; datos validados con Zod.
5. `prefers-reduced-motion` verificado (sin animaciones, todo legible).
6. Canje, cookie, `/api` y páginas protegidas sin regresiones (correr los tests existentes).
7. Búsqueda de `—` y `–` en `src/` devuelve 0 resultados.

## 11. Pendientes de contenido (no bloquean el diseño)

Logo del evento y key visual en alta resolución, fotos de ponentes (hoy iniciales), logos de aliados, URLs de Contacto/Organizan, dominio final, ubicación de la mesa de canje, contacto por códigos perdidos.
