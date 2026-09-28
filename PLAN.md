# Plan de construcción · Study Abroad Fest 2026

Plan para ejecutar en Claude Code, fase por fase. Cada fase trae su prompt listo para pegar.

**Punto de partida:** proyecto desde cero. La carpeta solo contiene `CLAUDE.md`, `PLAN.md` y `design/`. No se reutiliza código, componentes ni configuración de ningún otro sitio.

**Contexto de tiempo:** hoy es 27 de septiembre, el evento es el 10 de octubre.

**Hitos:**
- **1 oct:** landing pública en línea (Marketing empieza a difundir).
- **6 oct:** sistema de canje probado de punta a punta con códigos reales.
- **7 oct:** pasaportes y stickers de código impresos.
- **8 oct:** contenido congelado (horarios, convocatorias, tips).
- **10 oct:** evento. Canje activo desde las 2:00 p.m.

---

## 1. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Astro** (última versión estable) con el adaptador **@astrojs/vercel** | Todo el sitio se genera estático (rápido en celular). Solo las rutas del canje corren en el servidor, porque el calendario y los tips no pueden quedar públicos. |
| Estilos | **Tailwind CSS v4** con tokens en `@theme` | Los tokens de `CLAUDE.md` pasan a clases (`bg-sky`, `text-violet`). |
| Lenguaje | **TypeScript** estricto | Si falta un dato, el build falla antes de publicar. |
| Contenido | **`src/data/*.ts` + Zod** | Un solo lugar para horarios, ponentes, convocatorias y tips. Cada ítem con `estado`. |
| Tipografías | **@fontsource**: Lilita One, Figtree, IBM Plex Mono | Self-hosted. |
| Imágenes | Archivos locales en `src/assets/` + **astro:assets** | Tú subes las imágenes; Astro las optimiza. Nada de internet. |
| Animaciones | **CSS** (keyframes y transiciones) + **SVG** (`animateMotion` para el avión) + un script mínimo con `IntersectionObserver` para las paradas | Sin librerías de animación. Respeta `prefers-reduced-motion`. |
| Canje de códigos | **Endpoints de Astro en Vercel Functions** + **Upstash Redis** (desde Vercel Marketplace, plan gratuito) | Valida el código en el servidor, cuenta usos por código y deja el total de canjes como métrica del evento. |
| Sesión del canje | Cookie `httpOnly` firmada con HMAC (`CANJE_SECRET`) | El estudiante vuelve a su calendario sin reingresar el código. Sin cuentas ni contraseñas. |
| Descargable PDF | **Playwright** (devDependency) + `scripts/pdf.ts` | Imprime `/calendario/imprimir` a PDF A4. El PDF se guarda en `private/`, **nunca en `public/`**, y solo se entrega por un endpoint que revisa la cookie. |
| Descargable .ics | **`ics`** (npm) | Cierres de convocatorias al calendario del celular. También protegido por la cookie. El .ics del evento sí es público. |
| QR | Librería npm local (por ejemplo `qrcode`) | QR del PDF y de los stickers, generados sin servicios externos. |
| SEO / compartir | Meta tags + Open Graph 1200×630 + favicon | Vista previa en WhatsApp e Instagram. |
| Analítica | **Vercel Web Analytics** + UTM en enlaces a Luma | Visitas y canal de origen. |
| Deploy | **Vercel**, proyecto propio | Preview automático por rama. |

**Descartado a propósito:** CMS, base de datos de usuarios, cuentas de usuario y frameworks de UI (React/Vue). Redis solo guarda contadores de uso por código.

---

## 2. Mecánica del pasaporte (beneficio presencial)

**Objetivo:** que el Calendario de becas y los tips sean un beneficio de quienes asisten y recorren los stands, y que todo asistente que complete el recorrido lo reciba sí o sí.

### Recorrido del asistente
1. **Check-in:** recibe su **pasaporte impreso** (A5 doblado).
2. **Stands:** conversa con cada stand y recibe un **sello** en su pasaporte.
3. **Mesa de canje:** con todos los sellos, un voluntario revisa el pasaporte y le pega un **sticker con código único** (`SAF-XXXX-XXXX`) y su QR.
4. **Canje:** escanea el QR (abre `/canje?c=CODIGO` con el código ya escrito) o entra a `/canje` y lo escribe.
5. **Desbloqueo:** ve su calendario con tips por convocatoria, descarga el PDF y agrega los cierres a su calendario.

### Reglas del sistema

| Regla | Valor | Estado |
|---|---|---|
| Un código por pasaporte | Único, 8 caracteres sin letras confusas (sin 0/O, 1/I/L) | Propuesto |
| Dispositivos por código | Hasta **3** activaciones | Propuesto |
| Duración de la sesión | Cookie de 60 días | Propuesto |
| Intentos fallidos | Máximo 10 por IP cada 10 minutos | Propuesto |
| Cuándo se activa el canje | Desde el 10 oct, 2:00 p.m. (antes, `/canje` muestra "Disponible el día del evento") | Propuesto |
| Contenido protegido | Tabla de convocatorias con fechas, tips, PDF y .ics de cierres | Propuesto |
| Contenido público | Nombres de las convocatorias y la mecánica | Propuesto |

### Cómo funciona por dentro
- `scripts/codigos.ts` genera N códigos. Produce dos archivos:
  - `codigos-imprimir.csv` (código + URL del QR) para la imprenta. **En `.gitignore`, nunca se sube al repo.**
  - `src/server/codigos.json` con el **HMAC-SHA256** de cada código (no el código). Este sí se sube.
- `POST /api/canje` normaliza el código, calcula su HMAC, verifica que exista, suma 1 al contador en Redis (`canje:<hash>`) si es un dispositivo nuevo y rechaza si pasa de 3. Si es válido, crea la cookie firmada.
- `/mi-calendario` (renderizado en el servidor) revisa la cookie y muestra convocatorias y tips. Sin cookie válida, redirige a `/canje`.
- `GET /api/descarga/pdf` y `GET /api/descarga/ics` revisan la cookie y entregan los archivos.
- Si faltan las variables de Redis (desarrollo local), el canje funciona sin límite de usos y lo avisa en consola.
- **Métrica:** el total de códigos canjeados en Redis equivale a asistentes que completaron el recorrido de stands.

---

## 3. Estructura del repo

```
study-abroad-fest/
├── CLAUDE.md
├── PLAN.md
├── design/
│   ├── referencia-landing.html          # primera versión, solo estilo base
│   ├── key-visual.png
│   └── canvas/                          # diseño final exportado del canvas
│       ├── Main.dc.html                 # landing desktop completa
│       ├── Mobile.dc.html               # landing mobile
│       ├── Animaciones.dc.html          # guía de animaciones
│       ├── Seccion-Landing.dc.html      # nueva sección del calendario (pasaporte)
│       ├── Canje-Mobile.dc.html         # pantalla de canje y calendario desbloqueado
│       ├── Calendario-P1.dc.html        # PDF página 1
│       ├── Calendario-P2.dc.html        # PDF página 2
│       ├── Pasaporte-Exterior.dc.html   # impresión
│       └── Pasaporte-Interior.dc.html   # impresión
├── private/
│   └── calendario-becas-saf2026.pdf     # generado por scripts/pdf.ts, servido solo con cookie
├── public/  og-image.png, favicon.svg
├── scripts/
│   ├── pdf.ts
│   └── codigos.ts
└── src/
    ├── assets/  marca/  ponentes/  aliados/
    ├── data/
    │   ├── schema.ts  evento.ts  cronograma.ts  ponentes.ts  stands.ts  aliados.ts  faq.ts
    │   ├── postulaciones.ts             # convocatorias (nombre público; fechas protegidas)
    │   └── tips.ts                      # tips por convocatoria (solo se usa en el servidor)
    ├── server/
    │   ├── codigos.json                 # hashes de códigos
    │   ├── canje.ts                     # validar, contar, firmar cookie
    │   └── redis.ts
    ├── lib/  luma.ts  fechas.ts  motion.ts   # motion.ts: IntersectionObserver de paradas
    ├── components/
    │   ├── Hero.astro  Countdown.astro  Cronograma.astro  Ponentes.astro  TagPonente.astro
    │   ├── Stands.astro  PasaporteSeccion.astro  PaseAbordaje.astro  Faq.astro
    │   ├── CtaFinal.astro  DockMovil.astro
    │   ├── canje/  FormCodigo.astro  CalendarioDesbloqueado.astro  TarjetaConvocatoria.astro
    │   └── ui/  Button.astro  Pin.astro  RoadDivider.astro  Sello.astro
    ├── layouts/Base.astro
    ├── pages/
    │   ├── index.astro                          # estática
    │   ├── canje.astro                          # estática, formulario
    │   ├── mi-calendario.astro                  # servidor (prerender = false)
    │   ├── calendario/imprimir.astro            # solo para generar el PDF (noindex, bloqueada en producción)
    │   ├── evento.ics.ts                        # pública
    │   └── api/  canje.ts  descarga/pdf.ts  descarga/ics.ts   # servidor
    └── styles/global.css
```

---

## 4. Páginas y secciones

### Landing `/` (orden de secciones)

| # | Sección | Contenido | Estado de datos |
|---|---|---|---|
| 1 | **Hero** | Título, bajada, fecha/hora/lugar, gratis, CTA Luma, "Agregar a mi calendario" (.ics del evento), cuenta regresiva, key visual | Confirmado |
| 2 | **Cronograma** (pieza central) | Camino de papel con paradas y avión que lo recorre. Cada parada: hora, título, quién, espacio, modalidad. Carril paralelo "Stands abiertos 2:00 → 6:00" | Estructura confirmada, **horas pendientes** |
| 3 | **Ponentes** | Etiquetas de equipaje con sello de país. Grupo Zoom y grupo presencial. Nota: dudas oficiales en stands | Confirmado, fotos pendientes |
| 4 | **Stands y aliados** | UTP Internacional, EducationUSA, APEBEMO, Migajeando Becas. Aliados: + Erasmus+/Erasmus Mundus (EMA Perú) | Confirmado (Embajada de Japón como institución no participa; MEXT vía APEBEMO) |
| 5 | **Calendario de becas: se gana en el evento** | Mecánica en 3 pasos (pasaporte, sellos, código), visual del pasaporte sellándose, CTA "Inscríbete para ir" y "Ya tengo mi código" → `/canje` | Confirmado |
| 6 | **Pase de abordaje + FAQ** | Fecha, hora, lugar, cómo llegar, gratis. FAQ con una pregunta nueva: "¿Cómo consigo el Calendario de becas?" | Confirmado |
| 7 | **CTA final + footer** | Inscripción y organizadores | Confirmado |

Menú: Cronograma · Ponentes · Stands · Calendario de becas · Cómo llegar · Inscríbete.

### Canje `/canje` y `/mi-calendario`
Diseño: `design/canvas/Canje-Mobile.dc.html`. Mobile primero, porque el canje ocurre en el celular durante el evento.
- **Estado código:** ilustración del pasaporte, campo `SAF-XXXX-XXXX` (mayúsculas automáticas, acepta con o sin guiones), botón "Desbloquear calendario", ayuda "¿Aún no tienes código?".
- **Error:** el campo tiembla y muestra "Ese código no es válido. Revisa que esté completo, con el formato SAF-XXXX-XXXX." Si ya se usó en 3 dispositivos: "Este código ya se activó en 3 dispositivos. Acércate a la mesa de canje." Después del evento: "Escríbenos a [CONTACTO]".
- **Desbloqueado:** sello "APROBADO" que cae, botones Descargar PDF y Agregar cierres a mi calendario, y acordeón por convocatoria con fecha de cierre, 3 tips de su stand y enlace oficial.

### Cronograma: datos confirmados (según documento "STUDY ABROAD FEST 2026", horario corregido el 27 sep a la tarde)

> **Nota de consistencia:** el contenido y orden de este cronograma viene del documento "STUDY ABROAD FEST 2026"; las horas exactas fueron corregidas después, de vuelta al rango original 2:00-6:00 p.m. (la versión intermedia de 9:00 a.m. a 1:31 p.m. queda descartada). Un solo punto sigue por reconfirmar antes de publicarlo: el nombre correcto del ponente de Erasmus+ aparece como **"Guillermo Gonzalo"** en el documento nuevo y como "Guillermo Alfaro" en una fuente anterior. Se usa **Guillermo Gonzalo** por ser la fuente más reciente; avisar si no es correcto.

| Hora | Bloque | Quién | Modalidad |
|---|---|---|---|
| 14:00–14:10 | Bienvenida | LEAD UTP | Presencial |
| 14:10–14:15 | Cápsula | Fernando Injoque (Purdue) | Vlog + Q&A vía Zoom |
| 14:15–14:35 | Ponencia | Ivanna (Purdue) | Vlog + Q&A vía Zoom |
| 14:35–14:55 | Conferencia: convenios, requisitos y movilidad | UTP Internacional | Presencial |
| 14:55–15:25 | Panel de ex-becarios | Leslie Sánchez (UC Berkeley), Diego Mendoza (UC Berkeley) | Presencial |
| 15:25–15:45 | Beca Fulbright | EducationUSA | Presencial |
| 15:45–15:55 | Intermedio y networking | — | — |
| 15:55–16:00 | Cápsula | Mila (Japón) | Vlog + Q&A vía Zoom |
| 16:00–16:20 | Beca MEXT | APEBEMO | Presencial |
| 16:20–16:40 | Stand/ponencia | APEBEMO | Presencial |
| 16:40–16:45 | Cápsula | Guillermo Gonzalo (Erasmus+) *(antes "Guillermo Alfaro", ver nota arriba)* | Vlog + Q&A vía Zoom |
| 16:45–17:05 | Erasmus Mundus | EMA Perú | Presencial |
| 17:05–17:20 | Ponencia | Raquel Sánchez (conexión Erasmus Mundus) | Vía Zoom |
| 17:20–17:40 | Migajeando Becas | Raúl Jauregui | Presencial |
| 17:40–17:55 | Networking y mesas de consulta | — | — |
| 17:55–18:00 | Cierre | LEAD UTP | Presencial |
| paralelo | Stands | UTP Internacional, EducationUSA, APEBEMO, Migajeando Becas | Zona de stands, 2:00 a 6:00 p.m. |

**Nota:** el documento con este ajuste de horario ya no menciona a Nikole Meza (antes asociada a EducationUSA); se deja EducationUSA como institución a cargo del bloque de Fulbright hasta que se confirme si ella sigue participando.

**Pendiente de confirmar por separado:** si Carmen (Tec de Monterrey) y Lizbeth Dávila (ELAP · SIAS), presentes en la versión anterior del cronograma, siguen participando; no aparecen en el documento nuevo. No se elimina su ficha de `src/data/` hasta confirmarlo, pero tampoco se agrega al cronograma con hora hasta entonces.

### Modelo de datos: convocatorias y tips

```ts
// src/data/postulaciones.ts
{
  id: 'fulbright',
  programa: 'Beca Fulbright',        // público
  destino: 'Estados Unidos', codigoPais: 'US',
  institucion: 'EducationUSA',       // público
  apertura: '2026-xx-xx' | null,     // protegido
  cierre: '2026-xx-xx' | null,       // protegido
  urlOficial: 'https://…',           // protegido, obligatorio
  dondePreguntar: 'Stand EducationUSA',
  estado: 'confirmado' | 'por-confirmar',
  verificadoEl: '2026-10-xx',
}

// src/data/tips.ts  (solo se importa desde código de servidor)
{ convocatoria: 'fulbright', fuente: 'EducationUSA', tips: [string, string, string], estado: 'confirmado' | 'por-confirmar' }
```

- Fechas, enlaces y tips los entregan UTP Internacional y EducationUSA. Nadie del equipo web los redacta.
- Solo entra lo `confirmado`. Una convocatoria sin tips confirmados se muestra sin la sección de tips.

### PDF del calendario (2 páginas A4)
Diseño: `design/canvas/Calendario-P1.dc.html` y `Calendario-P2.dc.html`.
- **Página 1:** portada con cielo y camino, tira de 12 meses (oct 2026 a set 2027) para que el estudiante marque sus cierres, tabla de convocatorias (destino, apertura, cierre, dónde preguntar, QR a la web oficial), fecha de verificación.
- **Página 2:** "Mi ruta de postulación" (5 pasos para marcar), ficha "Mi convocatoria", "Documentos que me faltan" y contactos oficiales.
- Los tips van en la web desbloqueada y, si caben, como tercera página del PDF.

---

## 5. Guía de animaciones

Diseño y demo: `design/canvas/Animaciones.dc.html`. Curva base: `cubic-bezier(.2, .8, .2, 1)`. Todas se apagan con `prefers-reduced-motion: reduce`.

| # | Animación | Dónde | Disparador | Duración |
|---|---|---|---|---|
| 1 | Key visual flotando (sube 10 px, gira 1°) | Hero | Carga, en bucle | 7s ease-in-out |
| 2 | Líneas del camino en movimiento | Divisores y cronograma | Siempre | 1.6s lineal |
| 2b | Avión que recorre el cronograma (`animateMotion`) | Cronograma | Siempre | 9s |
| 3 | Paradas que se pegan como recortes, escalonadas | Cronograma | Al entrar en pantalla, una vez | 0.7s, 150 ms entre paradas |
| 4 | Sello de pasaporte que "golpea" | Tarjetas de ponentes | Hover (tap en celular) | 0.45s |
| 5 | Botón que se levanta (sube 3 px, gira 1°) y se hunde al clic | Todos los CTA | Hover / active | 0.18s |
| 6 | Nubes a la deriva | Hero, calendario, cierre | Siempre | 9 a 13s ida y vuelta |
| 7 | Número de la cuenta regresiva que cambia | Hero | Cada minuto | 0.4s |
| 8 | Parallax del hero por capas | Hero | Scroll | Opcional, requiere capas del key visual |
| 9 | Sellos cayendo sobre el pasaporte | Sección del calendario | En bucle suave | 5s |
| 10 | Sello "APROBADO" que cae al desbloquear | `/mi-calendario` | Al cargar | 0.6s |
| 11 | Campo que tiembla con código inválido | `/canje` | Error | 0.4s |

Regla: las secciones siempre se ven completas sin animación. Una parada nunca queda en `opacity: 0` esperando el scroll.

---

## 6. Lo que haces tú manualmente

Claude Code no puede hacer estas tareas. Están ordenadas por momento.

### Antes de abrir Claude Code (hoy)
- [ ] Crear en GitHub un repo nuevo y vacío llamado `study-abroad-fest` (sin README ni .gitignore).
- [ ] Clonarlo en tu computadora.
- [ ] Copiar a la raíz del repo `CLAUDE.md`, `PLAN.md` y la carpeta `design/` (incluye `design/canvas/`).
- [ ] Verificar Node.js 20 o superior (`node -v`).
- [ ] Abrir Claude Code en la carpeta del repo.

### Después de la Fase 1 (cuando exista `src/assets/`)
- [ ] Subir las imágenes con estos nombres:

| Carpeta | Archivo | Formato recomendado | Notas |
|---|---|---|---|
| `marca/` | `logo-evento.svg` (o `.png`) | SVG, o PNG transparente de 1200 px de ancho | Logo de la maleta con avión |
| `marca/` | `key-visual.png` | PNG o JPG, mínimo 1600 px por lado | Reemplaza la versión de 560 px |
| `marca/` | `logo-lead.svg`, `logo-utp.svg` | SVG o PNG transparente | Versión blanca, para fondo celeste |
| `ponentes/` | `carmen.jpg`, `fernando-injoque.jpg`, `guillermo-alfaro.jpg`, `diego-mendoza.jpg`, `leslie.jpg`, `lizbeth-davila.jpg` | JPG cuadrado, mínimo 600×600 | Solo fotos con autorización |
| `aliados/` | `utp-internacional.svg`, `educationusa.svg`, `erasmus-plus.svg` | SVG o PNG transparente | Versión oficial de cada logo |

- [ ] Commit y pedirle a Claude Code: *"Ya subí imágenes a src/assets/, conéctalas en los componentes."*

### Para el sistema de canje (Fase 5)
- [ ] En Vercel: **Storage → Marketplace → Upstash (Redis)**, crear una base gratuita y conectarla al proyecto. Esto agrega sus variables de entorno.
- [ ] En Vercel: **Settings → Environment Variables**, agregar `CANJE_SECRET` (una cadena larga aleatoria, Claude Code te da el comando para generarla). Usa la misma en tu `.env` local.
- [ ] Definir cuántos códigos generar: **[CANTIDAD]**, por ejemplo inscritos en Luma más un margen.
- [ ] Correr `npm run codigos -- --cantidad [CANTIDAD]` una sola vez. Guardar `codigos-imprimir.csv` fuera del repo y hacer commit solo de `src/server/codigos.json`.
- [ ] Si se pierde el CSV o se filtra, volver a generar todo (los códigos anteriores dejan de funcionar).

### Producción física (antes del 7 oct)
- [ ] **Pasaporte:** exportar `Pasaporte-Exterior` y `Pasaporte-Interior` del canvas en PDF e imprimir a doble cara en A5, doblado. Cantidad: la misma de códigos.
- [ ] **Stickers de código:** imprimir el CSV como etiquetas con código y QR (Claude Code puede generar el PDF de etiquetas en la Fase 5).
- [ ] **Sellos:** conseguir un sello o sticker distinto para cada uno de los 4 stands que sellan (UTP Internacional, EducationUSA, APEBEMO, Migajeando Becas). El diseño de cada sello ya está en `Pasaporte-Interior.dc.html`; puedes usarlo de referencia para mandar a hacer el sello físico o el sticker.
- [ ] **Mesa de canje:** definir ubicación (¿las mesas cercanas a la entrada?) y 1 o 2 voluntarios responsables de los stickers.
- [ ] **Briefing:** explicar a cada uno de los 4 stands que sella después de conversar con el estudiante, y a los voluntarios qué revisar y qué decir si alguien pierde su código.
- [ ] **Tips:** pedir a UTP Internacional, EducationUSA, APEBEMO y Migajeando Becas 3 tips por convocatoria, junto con las fechas.

### Publicar (Fase 7)
- [ ] vercel.com → **Add New → Project** → importar el repo.
- [ ] Activar **Analytics** en la pestaña Analytics.
- [ ] Dominio o subdominio si se consigue; si no, `.vercel.app`.
- [ ] Probar la vista previa del enlace en WhatsApp.
- [ ] Entregar a quien administra la web de LEAD UTP la URL con UTM: `?utm_source=leadutp_web&utm_medium=referral&utm_campaign=saf2026`.

### Del 2 al 10 de octubre
- [ ] Cargar horarios, convocatorias, tips y fotos faltantes (solo `src/data/`).
- [ ] Cada cambio de convocatorias: `npm run pdf`, commit y push.
- [ ] **6 oct:** prueba completa con 3 códigos reales en 3 celulares distintos (canje, límite de dispositivos, descarga del PDF y .ics).
- [ ] **8 oct:** revisión final y congelar contenido.
- [ ] **10 oct:** confirmar que el canje está activo a las 2:00 p.m. y revisar el contador de canjes al cierre.

---

## 7. Fases de ejecución en Claude Code

Cada fase termina con build limpio y un commit.

### Fase 1 · Scaffold y tokens (27 a 28 sep)
> Lee CLAUDE.md y PLAN.md. Este es un proyecto nuevo desde cero. Crea el proyecto con `npm create astro@latest` (plantilla mínima, TypeScript estricto), agrega Tailwind CSS v4 con la integración oficial y el adaptador @astrojs/vercel. Todas las páginas se prerenderizan salvo las que PLAN.md marca como servidor. Configura los tokens de CLAUDE.md en `@theme`, instala @fontsource para Lilita One, Figtree e IBM Plex Mono y crea `layouts/Base.astro` con lang="es-PE". Crea `src/assets/marca`, `ponentes` y `aliados` con `.gitkeep` y copia `design/key-visual.png` a `src/assets/marca/`. Crea `Button`, `Pin`, `RoadDivider` y `Sello` replicando `design/canvas/Main.dc.html`, con las animaciones 2, 5 y 6 de la sección 5. Agrega `private/`, `.env` y `codigos-imprimir.csv` al `.gitignore` donde corresponda. No crees secciones todavía.

### Fase 2 · Capa de datos (28 sep)
> Crea `src/data/schema.ts` con Zod y los archivos de `src/data/` según PLAN.md secciones 3 y 4. Carga solo datos confirmados; horas en null; postulaciones con fechas en null y `por-confirmar`; tips.ts vacío con un ejemplo `por-confirmar`. Cada ponente y aliado tiene un campo `imagen` opcional hacia `src/assets/`. Crea `lib/luma.ts` (`lumaUrl(source)` con UTM que respeta el parámetro tk) y `lib/fechas.ts` (es-PE, America/Lima). El build falla si un dato no cumple el esquema.

### Fase 3 · Landing (28 a 30 sep)
> Construye index.astro con las secciones de PLAN.md sección 4, portando `design/canvas/Main.dc.html` (desktop) y `design/canvas/Mobile.dc.html` (mobile) a componentes Astro + Tailwind. La sección 5 de la landing es `design/canvas/Seccion-Landing.dc.html`. Todo el texto de datos viene de `src/data/`. Imágenes solo desde `src/assets/` con placeholder si faltan. Implementa las animaciones 1, 2b, 3, 4, 6, 7, 8 (solo si existen capas) y 9 de PLAN.md sección 5, con `lib/motion.ts` para las paradas del cronograma. Agrega menú con anclas, dock de CTA fijo en celular y el endpoint público `evento.ics.ts`. Respeta todas las reglas de CLAUDE.md.

### Fase 4 · PDF del calendario (30 sep a 1 oct)
> Crea `pages/calendario/imprimir.astro` replicando `design/canvas/Calendario-P1.dc.html` y `Calendario-P2.dc.html` en A4, con noindex y bloqueada en producción (404 salvo en build local). QR generados localmente. Crea `scripts/pdf.ts` con Playwright: build, `astro preview`, imprime la ruta a `private/calendario-becas-saf2026.pdf` y cierra. Agrega `npm run pdf`.

### Fase 5 · Sistema de canje (1 a 3 oct)
> Implementa la mecánica de PLAN.md sección 2. (1) `scripts/codigos.ts`: genera N códigos `SAF-XXXX-XXXX` con alfabeto sin caracteres confusos, escribe `codigos-imprimir.csv` (código, URL `/canje?c=`) y `src/server/codigos.json` con HMAC-SHA256 usando `CANJE_SECRET`; agrega `npm run codigos`. Genera también `etiquetas.pdf` con código y QR en grilla para imprimir stickers. (2) `src/server/redis.ts` con Upstash; si faltan variables, modo sin límite con aviso. (3) `POST /api/canje`: normaliza, valida, límite de 3 dispositivos por código, 10 intentos fallidos por IP cada 10 min, cookie httpOnly firmada de 60 días, y activación desde 2026-10-10T14:00-05:00. (4) `canje.astro` y `mi-calendario.astro` replicando `design/canvas/Canje-Mobile.dc.html` con las animaciones 10 y 11; prellenar el código desde `?c=`. (5) `GET /api/descarga/pdf` y `/api/descarga/ics` protegidos por la cookie; incluye `private/` en la función con la opción `includeFiles` del adaptador. (6) Verifica que ni el PDF, ni las fechas, ni los tips aparezcan en el HTML estático ni en `dist/client`. Escribe pruebas unitarias para normalización, HMAC y firma de cookie.

### Fase 6 · SEO, accesibilidad y analítica (3 oct)
> Genera `public/og-image.png` 1200×630 desde el key visual con título, fecha y lugar. Configura meta tags, Open Graph, favicon y canonical. Agrega `@vercel/analytics`. Revisa contraste AA, foco visible, textos alternativos, etiquetas del formulario de canje y `prefers-reduced-motion`. Lighthouse móvil ≥ 90.

### Fase 7 · Publicación
Manual, ver sección 6. Si falla el deploy, pega el error de Vercel en Claude Code.

### Fase 8 · Carga de datos y cierre (2 a 8 oct)
> Actualiza `src/data/[archivo].ts` con estos datos confirmados: [pegar datos]. No cambies componentes. Si son convocatorias o tips, corre `npm run pdf` al final.

Postevento (opcional): banner "Gracias por venir" en la landing. El canje sigue activo para quienes tengan código.

---

## 8. Pendientes que bloquean contenido

| Pendiente | Bloquea | Responsable sugerido | Fecha límite |
|---|---|---|---|
| ~~Horarios exactos por bloque~~ | Cronograma | Pilar de Excelencia Académica | **Resuelto:** ver sección 4 |
| Confirmar nombre "Guillermo Gonzalo" vs. "Guillermo Alfaro" | Cronograma, tarjeta de ponente | Pilar | Antes de Fase 8 |
| Confirmar si Carmen (Tec de Monterrey) y Lizbeth Dávila (ELAP · SIAS) siguen participando | Cronograma, ponentes | Pilar | Antes de Fase 8 |
| Fechas y enlace oficial de cada convocatoria | Calendario, PDF, .ics | UTP Internacional, EducationUSA, APEBEMO, Migajeando Becas | 5 oct |
| 3 tips por convocatoria | Calendario desbloqueado | UTP Internacional, EducationUSA, APEBEMO, Migajeando Becas | 5 oct |
| Confirmar que son 4 stands los que sellan (UTP Internacional, EducationUSA, APEBEMO, Migajeando Becas) | Pasaporte impreso | Pilar | 3 oct |
| Cantidad de pasaportes y códigos | Impresión | Pilar | 4 oct |
| Sellos físicos por stand | Mecánica | Pilar | 7 oct |
| Ubicación y voluntarios de la mesa de canje | Mecánica | Pilar | 7 oct |
| Contacto para códigos perdidos después del evento | Mensaje de error del canje | Pilar | 6 oct |
| Logo del evento y key visual en alta | Hero, OG, pasaporte | Diseño | 29 sep |
| Fotos de ponentes (autorizadas) | Ponentes | Pilar | 1 oct |
| Archivos de logos de aliados | Stands y aliados | Pilar | 1 oct |
| Dominio o subdominio | Deploy, QR de stickers | LEAD UTP | 30 sep |
| ~~Situación de la Embajada de Japón~~ | Stands | Pilar | **Resuelto:** MEXT se presenta vía APEBEMO, la Embajada no participa directamente |

El dominio es crítico: los QR de los stickers llevan la URL final. **Hay que definirlo antes de generar los códigos.**
