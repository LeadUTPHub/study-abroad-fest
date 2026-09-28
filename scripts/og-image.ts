// Fase 6 (PLAN.md): genera public/og-image.png (1200×630) a partir del
// key visual, con título, fecha y lugar reales de src/data/evento.ts
// (CLAUDE.md, regla 1: nada de datos inventados). Usa Playwright, igual
// que scripts/pdf.ts y scripts/codigos.ts, con una página HTML
// autocontenida (fuentes e imagen embebidas en base64, sin red ni
// servidor) para no depender de que el sitio esté corriendo.
//
// Uso: npm run og-image
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import evento from "../src/data/evento";
import { formatoFechaCorta, formatoHora12 } from "../src/lib/fechas";

const SALIDA = path.resolve("public/og-image.png");
const KEY_VISUAL = path.resolve("src/assets/marca/key-visual.png");

async function base64DeArchivo(ruta: string): Promise<string> {
  return (await readFile(ruta)).toString("base64");
}

async function fuenteBase64(paquete: string, archivo: string): Promise<string> {
  const ruta = path.resolve(`node_modules/@fontsource/${paquete}/files/${archivo}`);
  return base64DeArchivo(ruta);
}

async function main() {
  const [keyVisualB64, lilitaOne, figtree800, figtree700, plexMono600] = await Promise.all([
    base64DeArchivo(KEY_VISUAL),
    fuenteBase64("lilita-one", "lilita-one-latin-400-normal.woff2"),
    fuenteBase64("figtree", "figtree-latin-800-normal.woff2"),
    fuenteBase64("figtree", "figtree-latin-700-normal.woff2"),
    fuenteBase64("ibm-plex-mono", "ibm-plex-mono-latin-600-normal.woff2"),
  ]);

  const rangoHoras = `${formatoHora12(evento.horaInicio)} a ${formatoHora12(evento.horaFin)}`;

  const html = `<!doctype html>
<html lang="es-PE">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: "Lilita One";
    src: url(data:font/woff2;base64,${lilitaOne}) format("woff2");
    font-weight: 400;
  }
  @font-face {
    font-family: "Figtree";
    src: url(data:font/woff2;base64,${figtree700}) format("woff2");
    font-weight: 700;
  }
  @font-face {
    font-family: "Figtree";
    src: url(data:font/woff2;base64,${figtree800}) format("woff2");
    font-weight: 800;
  }
  @font-face {
    font-family: "IBM Plex Mono";
    src: url(data:font/woff2;base64,${plexMono600}) format("woff2");
    font-weight: 600;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    width: 1200px;
    height: 630px;
    font-family: "Figtree", sans-serif;
    overflow: hidden;
  }
  body {
    position: relative;
    background: #3B99D8;
    display: flex;
    align-items: center;
    padding: 0 72px;
    gap: 56px;
  }
  .cloud {
    position: absolute;
    background: #FDFEFC;
    border-radius: 999px;
    opacity: .9;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    white-space: nowrap;
    background: rgba(29,33,82,.35);
    color: #FDFEFC;
    font-family: "IBM Plex Mono", monospace;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: .1em;
    text-transform: uppercase;
    padding: 10px 20px;
    border-radius: 999px;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: #FFE36B; }
  h1 {
    margin: 22px 0 0;
    font-family: "Lilita One", sans-serif;
    font-weight: 400;
    font-size: 88px;
    line-height: .96;
    color: #FDFEFC;
    text-shadow: 0 6px 0 rgba(29,33,82,.22);
  }
  .fest {
    margin-top: 10px;
    display: inline-block;
    width: fit-content;
    border: 6px solid #FDFEFC;
    border-radius: 22px;
    padding: 6px 26px 10px;
    font-size: 56px;
    letter-spacing: .06em;
    color: #FDFEFC;
    background: linear-gradient(100deg, #AC0BAD, #6258BB);
    box-shadow: 0 6px 0 rgba(29,33,82,.16);
  }
  .chips {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  .chip {
    background: #FDFEFC;
    color: #1D2152;
    font-weight: 800;
    font-size: 26px;
    padding: 12px 22px;
    border-radius: 14px;
    box-shadow: 0 4px 0 rgba(29,33,82,.15);
  }
  .chip b { color: #6258BB; font-weight: 800; }
  .visual {
    margin-left: auto;
    flex-shrink: 0;
    width: 420px;
    height: 420px;
    border-radius: 30px;
    border: 10px solid #FDFEFC;
    box-shadow: 0 8px 0 rgba(29,33,82,.16), 0 22px 40px -14px rgba(29,33,82,.45);
    overflow: hidden;
    transform: rotate(2.5deg);
  }
  .visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>
</head>
<body>
  <div class="cloud" style="width:150px;height:44px;top:36px;left:640px"></div>
  <div class="cloud" style="width:110px;height:34px;bottom:56px;left:200px;opacity:.7"></div>

  <div style="display:flex; flex-direction:column; max-width:660px;">
    <span class="badge"><span class="dot"></span>Feria de oportunidades internacionales</span>
    <h1>Study Abroad</h1>
    <div class="fest">FEST</div>
    <div class="chips">
      <span class="chip"><b>${formatoFechaCorta(evento.fecha)}</b></span>
      <span class="chip">${rangoHoras}</span>
      <span class="chip">${evento.lugar}</span>
    </div>
  </div>

  <div class="visual"><img src="data:image/png;base64,${keyVisualB64}" alt=""></div>
</body>
</html>`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: SALIDA, type: "png" });
  } finally {
    await browser.close();
  }

  console.log(`✓ ${SALIDA}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
