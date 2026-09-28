import type { APIRoute } from "astro";
import { createEvents, type EventAttributes } from "ics";
import postulaciones from "../../../data/postulaciones";
import { COOKIE_SESION, verificarSesion } from "../../../server/canje";

export const prerender = false;

// Cierres de convocatorias: contenido protegido (CLAUDE.md, regla 10),
// a diferencia del .ics público del propio evento (src/pages/evento.ics.ts).
export const GET: APIRoute = async ({ cookies }) => {
  if (!verificarSesion(cookies.get(COOKIE_SESION)?.value).valida) {
    return new Response("No autorizado. Canjea tu código en /canje.", { status: 401 });
  }

  const confirmadas = postulaciones.filter(
    (p): p is typeof p & { cierre: string } => p.estado === "confirmado" && p.cierre !== null,
  );

  const eventos: EventAttributes[] = confirmadas.map((p) => {
    const [anio, mes, dia] = p.cierre.split("-").map(Number);
    const descripcion = [`Convocatoria de ${p.destino}.`, p.urlOficial ? `Web oficial: ${p.urlOficial}` : null]
      .filter(Boolean)
      .join(" ");
    return {
      title: `Cierre: ${p.programa}`,
      description: descripcion,
      location: p.dondePreguntar ?? undefined,
      url: p.urlOficial ?? undefined,
      start: [anio, mes, dia],
      duration: { days: 1 },
    };
  });

  const { error, value } = createEvents(eventos, {
    productId: "-//Study Abroad Fest 2026//Calendario de becas//ES",
    calName: "Cierres de convocatorias · Study Abroad Fest 2026",
  });

  if (error || value === null) {
    console.error("[descarga/ics]", error);
    return new Response("No se pudo generar el calendario.", { status: 500 });
  }

  return new Response(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cierres-becas-saf2026.ics"',
      "Cache-Control": "private, no-store",
    },
  });
};
