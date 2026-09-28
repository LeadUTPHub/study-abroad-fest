// Lógica del canje (PLAN.md, sección 2): normalizar y validar el código,
// firmar/verificar la cookie de sesión, y decidir si el canje ya está
// activo. Todo lo de acá es puro (sin Astro, sin Redis) para poder
// probarlo con pruebas unitarias; la orquestación con Redis vive en
// src/server/redis.ts, y las rutas de servidor (src/pages/api/) conectan
// ambas piezas con las cookies de Astro.
import { createHmac, timingSafeEqual } from "node:crypto";
import evento from "../data/evento";
import { fechaHoraLima } from "../lib/fechas";
import { ALFABETO_CODIGO, cuerpoValido, formatearCodigo, LARGO_CUERPO } from "./alfabetoCodigo";
import codigosData from "./codigos.json";

export const COOKIE_SESION = "saf_calendario";
export const COOKIE_DISPOSITIVO = "saf_dispositivo";

export const DIAS_SESION = 60;
export const MAX_DISPOSITIVOS = 3;
export const MAX_INTENTOS_FALLIDOS = 10;
export const VENTANA_INTENTOS_SEGUNDOS = 10 * 60;

const MS_SESION = DIAS_SESION * 24 * 60 * 60 * 1000;

function requerirSecreto(): string {
  const secreto = process.env.CANJE_SECRET;
  if (!secreto) {
    throw new Error(
      "Falta la variable de entorno CANJE_SECRET (necesaria para el canje). Ver .env.example.",
    );
  }
  return secreto;
}

// ---------------------------------------------------------------------------
// Cuándo se activa el canje (PLAN.md, sección 2): desde el horario real del
// evento en src/data/evento.ts. Nunca se hardcodea la fecha por separado.
// ---------------------------------------------------------------------------
export function momentoActivacion(): Date {
  return fechaHoraLima(evento.fecha, evento.horaInicio);
}

export function canjeActivo(ahora: Date = new Date()): boolean {
  return ahora.getTime() >= momentoActivacion().getTime();
}

// ---------------------------------------------------------------------------
// Normalización y HMAC del código
// ---------------------------------------------------------------------------

/**
 * Acepta el código con o sin guiones, con o sin el prefijo "SAF", en
 * mayúsculas o minúsculas. Devuelve la forma canónica "SAF-XXXX-XXXX", o
 * `null` si no tiene el formato esperado (PLAN.md: "SAF-XXXX-XXXX...
 * acepta con o sin guiones").
 */
export function normalizarCodigo(entrada: string): string | null {
  const limpio = entrada.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const cuerpo = limpio.startsWith("SAF") ? limpio.slice(3) : limpio;
  if (cuerpo.length !== LARGO_CUERPO || !cuerpoValido(cuerpo)) return null;
  return formatearCodigo(cuerpo);
}

/** HMAC-SHA256 en hex del código ya normalizado. Nunca se guarda el código. */
export function hashCodigo(codigoNormalizado: string): string {
  return createHmac("sha256", requerirSecreto()).update(codigoNormalizado).digest("hex");
}

// ---------------------------------------------------------------------------
// Cookie de sesión firmada (60 días). El valor es "payload.firma", donde
// payload es JSON en base64url y firma es su HMAC-SHA256 en base64url.
// ---------------------------------------------------------------------------
interface PayloadSesion {
  hash: string;
  /** Últimos 4 caracteres del código (p. ej. "6789"), solo para mostrar
   *  "Código SAF-····-6789" en /mi-calendario. El código completo nunca
   *  se guarda en ningún lado, ni siquiera acá: esto no alcanza para
   *  reconstruirlo ni para canjearlo de nuevo. */
  ultimos4: string;
  emitidoEl: number;
}

export type ResultadoSesion = { valida: true; ultimos4: string } | { valida: false };

function firmar(payload: string): string {
  return createHmac("sha256", requerirSecreto()).update(payload).digest("base64url");
}

/** Arma el valor listo para `cookies.set(COOKIE_SESION, valor, opciones)`. */
export function firmarSesion(hash: string, ultimos4: string, emitidoEl: number = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ hash, ultimos4, emitidoEl } satisfies PayloadSesion),
  ).toString("base64url");
  return `${payload}.${firmar(payload)}`;
}

/**
 * Verifica la cookie de sesión: firma válida (comparación en tiempo
 * constante) y todavía dentro de los 60 días. No confía en el Max-Age del
 * navegador: si alguien reutiliza un valor viejo después de vencido, se
 * rechaza igual.
 */
export function verificarSesion(valor: string | undefined | null, ahora: number = Date.now()): ResultadoSesion {
  const invalida: ResultadoSesion = { valida: false };
  if (!valor) return invalida;
  const separador = valor.indexOf(".");
  if (separador === -1) return invalida;
  const payload = valor.slice(0, separador);
  const firma = valor.slice(separador + 1);
  if (!payload || !firma) return invalida;

  const esperada = firmar(payload);
  const bufFirma = Buffer.from(firma);
  const bufEsperada = Buffer.from(esperada);
  if (bufFirma.length !== bufEsperada.length || !timingSafeEqual(bufFirma, bufEsperada)) {
    return invalida;
  }

  try {
    const datos = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as Partial<PayloadSesion>;
    if (
      typeof datos.hash !== "string" ||
      typeof datos.ultimos4 !== "string" ||
      typeof datos.emitidoEl !== "number"
    ) {
      return invalida;
    }
    if (ahora - datos.emitidoEl > MS_SESION) return invalida;
    return { valida: true, ultimos4: datos.ultimos4 };
  } catch {
    return invalida;
  }
}

// ---------------------------------------------------------------------------
// Códigos válidos (src/server/codigos.json, generado por scripts/codigos.ts;
// PLAN.md, Fase 5, punto 1). Nunca guarda el código en texto plano, solo
// su hash.
// ---------------------------------------------------------------------------
const hashesValidos = new Set<string>(codigosData.hashes);

export function existeCodigo(hash: string): boolean {
  return hashesValidos.has(hash);
}

export function totalCodigosGenerados(): number {
  return hashesValidos.size;
}

export { ALFABETO_CODIGO };
