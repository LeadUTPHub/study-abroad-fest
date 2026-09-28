// ADVERTENCIA — contenido protegido (CLAUDE.md, regla 10).
// Este archivo SOLO se importa desde código de servidor (mi-calendario.astro
// con `export const prerender = false`, o api/*). Nunca debe llegar a una
// página prerenderizada, a public/ ni al JavaScript de cliente.

import { TipSchema, type Tip } from "./schema";

// Vacío salvo un ejemplo "por-confirmar" que muestra la forma esperada
// (PLAN.md, Fase 2). Se reemplaza cuando UTP Internacional / EducationUSA
// entreguen los 3 tips reales por convocatoria (PLAN.md, sección 8: bloquea
// "Calendario desbloqueado", 5 oct).
const tipsRaw: Tip[] = [
  {
    convocatoriaId: "fulbright",
    fuente: "EducationUSA",
    tips: ["Tip de ejemplo: reemplazar por los 3 tips reales que entregue EducationUSA."],
    estado: "por-confirmar",
  },
];

const tips: Tip[] = tipsRaw.map((t) => TipSchema.parse(t));

export default tips;
