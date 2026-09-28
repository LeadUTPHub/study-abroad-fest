#!/usr/bin/env node
// PLAN.md, Fase 4: /calendario/imprimir debe quedar bloqueada (404) en
// producción, salvo en un build local.
//
// src/pages/calendario/imprimir.astro ya deja de mostrar contenido
// protegido (fechas de convocatorias, enlaces oficiales) en cuanto
// detecta `process.env.VERCEL`, pero esa página sigue siendo estática
// (ver el comentario ahí sobre por qué), y Astro no traduce
// `Astro.response.status` a un status HTTP real para páginas
// prerenderizadas (solo lo hace para redirects 3xx). Este script corre
// después de `astro build` y, SOLO si la build ocurre con la variable
// de entorno VERCEL puesta, le agrega al config.json del adaptador
// (Build Output API v3) una regla que hace que Vercel responda un 404
// de verdad en esa ruta.
//
// No hace nada en un build local (npm run pdf, por ejemplo): el
// config.json queda exactamente como lo deja @astrojs/vercel.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

if (!process.env.VERCEL) {
  process.exit(0);
}

const RUTA_CONFIG = path.resolve(".vercel/output/config.json");

const config = JSON.parse(await readFile(RUTA_CONFIG, "utf-8"));

const regla = { src: "^/calendario/imprimir/?$", status: 404, dest: "/404.html" };

const yaExiste = config.routes?.some((r) => r.src === regla.src);
if (yaExiste) {
  process.exit(0);
}

const indiceFilesystem = config.routes?.findIndex((r) => r.handle === "filesystem") ?? -1;
if (indiceFilesystem === -1) {
  throw new Error(
    `No se encontró la regla "handle: filesystem" en ${RUTA_CONFIG}; revisa si @astrojs/vercel cambió su formato de salida.`,
  );
}

config.routes.splice(indiceFilesystem, 0, regla);
await writeFile(RUTA_CONFIG, JSON.stringify(config, null, 2));

console.log("✓ /calendario/imprimir queda bloqueada (404) en este deploy de Vercel.");
