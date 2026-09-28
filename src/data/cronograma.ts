import {
  CronogramaBloqueSchema,
  CarrilParaleloSchema,
  type CronogramaBloque,
  type CarrilParalelo,
} from "./schema";

// Solo el orden está confirmado (PLAN.md, sección 4 · "Cronograma: datos de
// partida"). Las horas quedan en null hasta que Pilar de Excelencia
// Académica las confirme (bloquea: "Horarios exactos por bloque", 3 oct).
const bloquesRaw: CronogramaBloque[] = [
  {
    orden: 1,
    titulo: "Apertura",
    quien: "LEAD UTP · Pilar de Excelencia Académica",
    espacio: "auditorio",
    modalidad: "presencial",
    hora: null,
    estado: "por-confirmar",
  },
  {
    orden: 2,
    titulo: "Conferencia magistral: convenios, requisitos y movilidad",
    quien: "UTP Internacional",
    espacio: "auditorio",
    modalidad: "presencial",
    hora: null,
    estado: "por-confirmar",
  },
  {
    orden: 3,
    titulo: "Beca Fulbright",
    quien: "EducationUSA",
    espacio: "auditorio",
    modalidad: "presencial",
    hora: null,
    estado: "por-confirmar",
  },
  {
    orden: 4,
    titulo: "Ponencias internacionales",
    quien:
      "Carmen (Tecnológico de Monterrey), Fernando Injoque (Purdue University), Guillermo Alfaro (Erasmus), Diego Mendoza (UC Berkeley)",
    espacio: "auditorio",
    // Vlog pregrabado + preguntas en vivo por Zoom. Nunca "presencial"
    // (CLAUDE.md, regla 6).
    modalidad: "vlog-zoom",
    hora: null,
    estado: "por-confirmar",
  },
  {
    orden: 5,
    titulo: "Panel de ex-becarios",
    quien: "Leslie (UC Berkeley), Lizbeth Dávila (ELAP · SIAS)",
    espacio: "auditorio",
    modalidad: "presencial",
    hora: null,
    estado: "por-confirmar",
  },
];

export const bloques: CronogramaBloque[] = bloquesRaw.map((b) => CronogramaBloqueSchema.parse(b));

// El carril de stands corre en paralelo al auditorio, durante todo el
// horario del evento (ya confirmado en src/data/evento.ts).
const carrilParaleloRaw: CarrilParalelo = {
  titulo: "Stands abiertos",
  horaInicio: "14:00",
  horaFin: "18:00",
  quienes: ["UTP Internacional", "EducationUSA"],
  nota: "Requisitos, promedios, convalidación, visados y fechas de postulación. Aquí se resuelve lo oficial.",
  estado: "confirmado",
};

export const carrilParalelo: CarrilParalelo = CarrilParaleloSchema.parse(carrilParaleloRaw);
