import {
  CronogramaBloqueSchema,
  CarrilParaleloSchema,
  type CronogramaBloque,
  type CarrilParalelo,
} from "./schema";

// Datos confirmados según el documento "STUDY ABROAD FEST 2026"
// (PLAN.md, sección "Cronograma: datos confirmados"). Reemplaza la versión
// anterior (lugar, horario y horas exactas cambiaron por completo).
//
// El documento fuente ya no distingue "espacio" por bloque (antes sí lo
// hacía), así que queda en null: no se inventa "auditorio" para todos.
//
// Un solo bloque queda "por-confirmar": la cápsula de Erasmus+, porque el
// nombre del ponente todavía se está reconfirmando ("Guillermo Gonzalo" vs.
// "Guillermo Alfaro" — PLAN.md, sección 8).
const bloquesRaw: CronogramaBloque[] = [
  {
    orden: 1,
    titulo: "Bienvenida",
    quien: "LEAD UTP",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "09:00",
    horaFin: "09:15",
    estado: "confirmado",
  },
  {
    orden: 2,
    titulo: "Cápsula",
    quien: "Fernando Injoque (Purdue)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "09:15",
    horaFin: "09:22",
    estado: "confirmado",
  },
  {
    orden: 3,
    titulo: "Ponencia",
    quien: "Ivanna (Purdue)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "09:22",
    horaFin: "09:42",
    estado: "confirmado",
  },
  {
    orden: 4,
    titulo: "Conferencia: convenios, requisitos y movilidad",
    quien: "UTP Internacional",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "09:47",
    horaFin: "10:07",
    estado: "confirmado",
  },
  {
    orden: 5,
    titulo: "Panel de ex-becarios",
    quien: "Leslie Sánchez (UC Berkeley), Diego Mendoza (UC Berkeley)",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "10:12",
    horaFin: "10:42",
    estado: "confirmado",
  },
  {
    orden: 6,
    titulo: "Beca Fulbright",
    quien: "EducationUSA · Nikole Meza",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "10:47",
    horaFin: "11:07",
    estado: "confirmado",
  },
  {
    orden: 7,
    titulo: "Intermedio",
    quien: null,
    espacio: null,
    modalidad: "receso",
    horaInicio: "11:07",
    horaFin: "11:22",
    estado: "confirmado",
  },
  {
    orden: 8,
    titulo: "Cápsula",
    quien: "Mila (Japón)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "11:22",
    horaFin: "11:29",
    estado: "confirmado",
  },
  {
    orden: 9,
    titulo: "Beca MEXT",
    quien: "APEBEMO",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "11:29",
    horaFin: "11:49",
    estado: "confirmado",
  },
  {
    orden: 10,
    titulo: "Stand/ponencia",
    quien: "APEBEMO",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "11:54",
    horaFin: "12:14",
    estado: "confirmado",
  },
  {
    orden: 11,
    titulo: "Cápsula",
    // Pendiente de reconfirmar (ver comentario arriba y PLAN.md sección 8).
    quien: "Guillermo Gonzalo (Erasmus+)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "12:14",
    horaFin: "12:21",
    estado: "por-confirmar",
  },
  {
    orden: 12,
    titulo: "Erasmus Mundus",
    quien: "EMA Perú",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "12:21",
    horaFin: "12:41",
    estado: "confirmado",
  },
  {
    orden: 13,
    titulo: "Ponencia",
    quien: "Raquel Sánchez",
    espacio: null,
    modalidad: "zoom-vivo",
    horaInicio: "12:41",
    horaFin: "12:56",
    estado: "confirmado",
  },
  {
    orden: 14,
    titulo: "Migajeando Becas",
    quien: "Raúl Jauregui",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "13:01",
    horaFin: "13:21",
    estado: "confirmado",
  },
  {
    orden: 15,
    titulo: "Cierre",
    quien: "LEAD UTP",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "13:21",
    horaFin: "13:31",
    estado: "confirmado",
  },
];

export const bloques: CronogramaBloque[] = bloquesRaw.map((b) => CronogramaBloqueSchema.parse(b));

// El carril de stands corre en paralelo a todo el programa del auditorio,
// durante todo el horario del evento (src/data/evento.ts).
const carrilParaleloRaw: CarrilParalelo = {
  titulo: "Stands abiertos",
  horaInicio: "09:00",
  horaFin: "13:31",
  quienes: ["UTP Internacional", "EducationUSA", "APEBEMO", "Migajeando Becas"],
  nota: "Requisitos, promedios, convalidación, visados y fechas de postulación. Aquí se resuelve lo oficial.",
  estado: "confirmado",
};

export const carrilParalelo: CarrilParalelo = CarrilParaleloSchema.parse(carrilParaleloRaw);
