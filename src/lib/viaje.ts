// Formatos de hora y fecha del concepto Viaje. Todo recibe datos de
// src/data/ ("HH:mm" en hora de Lima) y devuelve texto listo para mostrar.

/** "14:35" a "2:35 p.m." (formato de las cabeceras de grupo del cronograma). */
export function hora12(hora: string): string {
  const [hh = "0", mm = "00"] = hora.split(":");
  const h = Number(hh);
  const sufijo = h >= 12 ? "p.m." : "a.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${sufijo}`;
}

/** "14:00", "18:00" a "2:00 a 6:00 p.m." (mismo sufijo compartido). */
export function rangoHoras(inicio: string, fin: string): string {
  const a = hora12(inicio);
  const b = hora12(fin);
  const [ha, sa] = a.split(" ");
  const [, sb] = b.split(" ");
  return sa === sb ? `${ha} a ${b}` : `${a} a ${b}`;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** "2026-10-10" a { corta: "Sáb 10 oct", anio: "2026" }. */
export function fechaEvento(fecha: string): { corta: string; anio: string } {
  const [y = "0", m = "1", d = "1"] = fecha.split("-");
  // Mediodía UTC: el día de la semana no depende de la zona horaria.
  const dia = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 12));
  return { corta: `${DIAS[dia.getUTCDay()]} ${Number(d)} ${MESES[Number(m) - 1]}`, anio: y };
}

export const pad2 = (n: number): string => String(n).padStart(2, "0");
