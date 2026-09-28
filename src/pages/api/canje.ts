import type { APIRoute } from "astro";
import {
  canjeActivo,
  COOKIE_DISPOSITIVO,
  COOKIE_SESION,
  DIAS_SESION,
  existeCodigo,
  firmarSesion,
  hashCodigo,
  normalizarCodigo,
} from "../../server/canje";
import { intentosSuperados, registrarActivacion } from "../../server/redis";

export const prerender = false;

type CodigoError = "formato" | "no-disponible" | "intentos" | "invalido" | "dispositivos";

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function error(status: number, codigo: CodigoError): Response {
  return json(status, { ok: false, error: codigo });
}

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return error(400, "formato");
  }

  const codigoCrudo = (cuerpo as { codigo?: unknown } | null)?.codigo;
  if (typeof codigoCrudo !== "string") {
    return error(400, "formato");
  }

  // PLAN.md, sección 2: el canje se activa desde el horario del evento.
  if (!canjeActivo()) {
    return error(403, "no-disponible");
  }

  // Máximo 10 intentos fallidos por IP cada 10 minutos. clientAddress
  // puede no estar disponible según el adaptador; nunca debe tumbar la
  // petición.
  let ip = "desconocida";
  try {
    if (typeof clientAddress === "string" && clientAddress.length > 0) {
      ip = clientAddress;
    }
  } catch {
    // el adaptador no expone clientAddress en este contexto
  }
  if (await intentosSuperados(ip)) {
    return error(429, "intentos");
  }

  const normalizado = normalizarCodigo(codigoCrudo);
  const hash = normalizado ? hashCodigo(normalizado) : null;
  if (!normalizado || !hash || !existeCodigo(hash)) {
    return error(400, "invalido");
  }

  // Identificador de dispositivo anónimo, independiente de la sesión: se
  // usa solo para contar activaciones distintas por código (hasta 3).
  let deviceId = cookies.get(COOKIE_DISPOSITIVO)?.value;
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    cookies.set(COOKIE_DISPOSITIVO, deviceId, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
      maxAge: 400 * 24 * 60 * 60,
    });
  }

  const resultado = await registrarActivacion(hash, deviceId);
  if (resultado === "limite") {
    return error(403, "dispositivos");
  }

  cookies.set(COOKIE_SESION, firmarSesion(hash, normalizado.slice(-4)), {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESION * 24 * 60 * 60,
  });

  return json(200, { ok: true });
};
