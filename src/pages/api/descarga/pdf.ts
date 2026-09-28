import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { COOKIE_SESION, verificarSesion } from "../../../server/canje";

export const prerender = false;

// El PDF vive en private/ (nunca en public/, CLAUDE.md regla 10) y se
// suma al bundle de la función con `includeFiles` en astro.config.mjs.
const RUTA_PDF = path.resolve("private/calendario-becas-saf2026.pdf");

export const GET: APIRoute = async ({ cookies }) => {
  if (!verificarSesion(cookies.get(COOKIE_SESION)?.value).valida) {
    return new Response("No autorizado. Canjea tu código en /canje.", { status: 401 });
  }

  let datos: Buffer;
  try {
    datos = await readFile(RUTA_PDF);
  } catch {
    return new Response(
      "El PDF todavía no se generó (falta correr npm run pdf). Vuelve a intentarlo más tarde.",
      { status: 404 },
    );
  }

  return new Response(new Uint8Array(datos), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="calendario-becas-saf2026.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
};
