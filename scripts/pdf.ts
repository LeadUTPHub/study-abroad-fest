// PLAN.md, Fase 4: build -> astro preview -> imprime /calendario/imprimir
// a private/calendario-becas-saf2026.pdf con Playwright, y cierra.
//
// Corre SIEMPRE localmente (nunca en Vercel): src/pages/calendario/imprimir.astro
// se bloquea a sí misma (404) cuando detecta la variable de entorno
// VERCEL, así que solo un build en esta máquina produce la página
// completa que este script necesita imprimir.
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const PUERTO = 4322; // distinto del puerto por defecto, para no chocar con un `astro dev` abierto
const ORIGEN = `http://localhost:${PUERTO}`;
const RUTA = "/calendario/imprimir";
const SALIDA = path.resolve("private/calendario-becas-saf2026.pdf");

const NPM = "npm";
// En Windows, "npm" es un .cmd: hace falta una shell para resolverlo. En
// macOS/Linux es un ejecutable real y no la necesita. Los argumentos son
// siempre constantes fijas (nunca datos externos), así que no hay riesgo
// de inyección pese al shell.
const CON_SHELL = process.platform === "win32";

function ejecutar(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(NPM, args, { stdio: "inherit", shell: CON_SHELL });
    proc.on("error", reject);
    proc.on("exit", (codigo) => {
      if (codigo === 0) resolve();
      else reject(new Error(`"npm ${args.join(" ")}" salió con código ${codigo}`));
    });
  });
}

function lanzarPreview(): ChildProcess {
  return spawn(NPM, ["run", "preview", "--", "--port", String(PUERTO)], { stdio: "inherit", shell: CON_SHELL });
}

/**
 * Con `shell: true` en Windows, `child.kill()` solo mata el cmd.exe
 * envoltorio, no a npm ni a "astro preview" (quedan huérfanos con el
 * puerto abierto). `taskkill /t` sí mata todo el árbol de procesos.
 */
function detenerPreview(preview: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (preview.pid === undefined || preview.exitCode !== null) return resolve();
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(preview.pid), "/t", "/f"], { stdio: "ignore", shell: true }).on(
        "exit",
        () => resolve(),
      );
    } else {
      preview.kill("SIGTERM");
      resolve();
    }
  });
}

async function esperarServidor(url: string, intentos = 40): Promise<void> {
  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // el servidor todavía no levanta; reintenta
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No se pudo conectar a ${url} después de ${intentos} intentos.`);
}

async function main() {
  await mkdir(path.dirname(SALIDA), { recursive: true });

  console.log("→ npm run build");
  await ejecutar(["run", "build"]);

  console.log("→ npm run preview");
  const preview = lanzarPreview();
  preview.on("error", (err) => {
    throw err;
  });

  try {
    await esperarServidor(`${ORIGEN}/`);

    console.log(`→ imprimiendo ${ORIGEN}${RUTA}`);
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      const respuesta = await page.goto(`${ORIGEN}${RUTA}`, { waitUntil: "networkidle" });
      if (!respuesta || !respuesta.ok()) {
        throw new Error(
          `${RUTA} respondió ${respuesta?.status()}. ¿Está corriendo con la variable de entorno VERCEL puesta por error?`,
        );
      }
      await page.pdf({
        path: SALIDA,
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
    } finally {
      await browser.close();
    }

    console.log(`✓ PDF generado en ${SALIDA}`);
  } finally {
    await detenerPreview(preview);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
