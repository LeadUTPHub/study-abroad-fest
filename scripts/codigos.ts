// PLAN.md, Fase 5, punto (1): genera N códigos SAF-XXXX-XXXX y produce:
//   - codigos-imprimir.csv   (código + URL del QR, para la imprenta;
//                             NUNCA se sube al repo, ver .gitignore)
//   - src/server/codigos.json (HMAC-SHA256 de cada código; este sí se sube)
//   - private/etiquetas.pdf  (grilla de código + QR para imprimir stickers;
//                             tampoco se sube, ver .gitignore de private/)
//
// Uso:
//   npm run codigos -- --cantidad 500 --base-url https://tu-dominio.pe
//
// El dominio todavía está pendiente (PLAN.md, sección 8: "Hay que
// definirlo antes de generar los códigos"), así que --base-url (o la
// variable de entorno SITE_URL) es obligatorio: no se inventa un
// dominio de relleno para los QR.
//
// Esta tarea es manual (PLAN.md, sección 6): la corre el equipo una vez
// que sepa cuántos códigos necesita y cuál es el dominio final.
import { randomInt } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { qrSvg } from "../src/lib/qr";
import { hashCodigo, normalizarCodigo } from "../src/server/canje";
import { ALFABETO_CODIGO, formatearCodigo, LARGO_CUERPO } from "../src/server/alfabetoCodigo";

try {
  process.loadEnvFile();
} catch {
  // Sin .env local (p. ej. en CI): seguimos con lo que ya haya en el entorno.
}

interface Argumentos {
  cantidad: number | null;
  baseUrl: string | null;
}

function leerArgumentos(): Argumentos {
  const args = process.argv.slice(2);
  let cantidad: number | null = null;
  let baseUrl: string | null = process.env.SITE_URL ?? null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cantidad") cantidad = Number(args[++i]);
    else if (args[i] === "--base-url") baseUrl = args[++i];
  }
  return { cantidad, baseUrl };
}

function generarCuerpo(): string {
  let cuerpo = "";
  for (let i = 0; i < LARGO_CUERPO; i++) {
    cuerpo += ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)];
  }
  return cuerpo;
}

function generarCodigosUnicos(cantidad: number): string[] {
  const vistos = new Set<string>();
  while (vistos.size < cantidad) {
    vistos.add(formatearCodigo(generarCuerpo()));
  }
  return [...vistos];
}

interface Fila {
  codigo: string;
  url: string;
}

async function generarEtiquetasPdf(filas: Fila[], destino: string): Promise<void> {
  const items = await Promise.all(
    filas.map(async (f) => ({ codigo: f.codigo, qr: await qrSvg(f.url) })),
  );

  const etiquetas = items
    .map(
      ({ codigo, qr }) => `
    <div class="etiqueta">
      <div class="qr">${qr}</div>
      <div class="codigo">${codigo}</div>
    </div>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 10mm; }
  body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; }
  .grilla {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4mm;
  }
  .etiqueta {
    break-inside: avoid;
    border: 1px dashed #ABAEC8;
    border-radius: 4mm;
    padding: 3mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2mm;
  }
  .qr { width: 22mm; height: 22mm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .codigo {
    font-family: "Consolas", "Courier New", monospace;
    font-weight: 600;
    font-size: 12pt;
    letter-spacing: .04em;
  }
</style>
</head>
<body>
  <div class="grilla">${etiquetas}</div>
</body>
</html>`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({ path: destino, printBackground: true });
  } finally {
    await browser.close();
  }
}

async function main() {
  const { cantidad, baseUrl } = leerArgumentos();

  if (!cantidad || !Number.isInteger(cantidad) || cantidad <= 0) {
    console.error("Uso: npm run codigos -- --cantidad <N> --base-url <https://tu-dominio>");
    process.exitCode = 1;
    return;
  }
  if (!baseUrl) {
    console.error(
      "Falta --base-url (o la variable de entorno SITE_URL). El dominio final todavía está " +
        "pendiente (PLAN.md, sección 8) y los QR necesitan una URL absoluta para funcionar al " +
        "escanearlos: no se inventa un dominio de relleno.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`→ Generando ${cantidad} códigos únicos...`);
  const codigos = generarCodigosUnicos(cantidad);

  const raiz = baseUrl.replace(/\/$/, "");
  const filas: Fila[] = codigos.map((codigo) => ({
    codigo,
    url: `${raiz}/canje?c=${encodeURIComponent(codigo)}`,
  }));

  const csv = ["codigo,url", ...filas.map((f) => `${f.codigo},${f.url}`)].join("\n") + "\n";
  const rutaCsv = path.resolve("codigos-imprimir.csv");
  await writeFile(rutaCsv, csv, "utf-8");
  console.log(`✓ ${rutaCsv} (NUNCA se sube al repo)`);

  const hashes = codigos.map((codigo) => {
    const normalizado = normalizarCodigo(codigo);
    if (!normalizado) throw new Error(`Código generado con formato inválido: ${codigo}`);
    return hashCodigo(normalizado);
  });
  const rutaJson = path.resolve("src/server/codigos.json");
  await mkdir(path.dirname(rutaJson), { recursive: true });
  await writeFile(
    rutaJson,
    JSON.stringify({ generadoEl: new Date().toISOString(), hashes }, null, 2) + "\n",
    "utf-8",
  );
  console.log(`✓ ${rutaJson} (este sí se sube)`);

  console.log("→ Generando private/etiquetas.pdf...");
  const rutaEtiquetas = path.resolve("private/etiquetas.pdf");
  await mkdir(path.dirname(rutaEtiquetas), { recursive: true });
  await generarEtiquetasPdf(filas, rutaEtiquetas);
  console.log(`✓ ${rutaEtiquetas}`);

  console.log(`\n${cantidad} códigos listos. Si se pierde el CSV o se filtra, hay que volver a`);
  console.log("generar todo: los códigos anteriores dejan de funcionar (PLAN.md, sección 6).");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
