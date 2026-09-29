import {
  CronogramaBloqueSchema,
  CarrilParaleloSchema,
  type CronogramaBloque,
  type CarrilParalelo,
} from "./schema";

// Datos confirmados según el documento "STUDY ABROAD FEST 2026", con la
// corrección de horario: el evento vuelve a ser 2:00 p.m. a 6:00 p.m.
// (no 9:00 a.m. a 1:31 p.m., como se había indicado antes). Mismo
// contenido y orden; solo cambian las horas, y se agrega el bloque de
// "Networking y mesas de consulta" antes del cierre (16 bloques en
// total).
//
// El documento fuente no da "espacio" por bloque, así que queda en
// null: no se inventa "auditorio" para todos.
//
// Un solo bloque queda "por-confirmar": la cápsula de Erasmus+, porque
// el nombre del ponente todavía se está reconfirmando ("Guillermo
// Gonzalo" frente a "Guillermo Alfaro". PLAN.md, sección 8.
//
// La fuente ya no da un nombre de persona para el bloque de Fulbright
// (antes decía "EducationUSA · Nikole Meza"): queda solo la
// institución hasta que se confirme.
const bloquesRaw: CronogramaBloque[] = [
  {
    orden: 1,
    titulo: "Bienvenida",
    quien: "LEAD UTP",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "14:00",
    horaFin: "14:10",
    estado: "confirmado",
  },
  {
    orden: 2,
    titulo: "Cápsula",
    quien: "Fernando Injoque (Purdue)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "14:10",
    horaFin: "14:15",
    estado: "confirmado",
  },
  {
    orden: 3,
    titulo: "Ponencia",
    quien: "Ivanna (Purdue)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "14:15",
    horaFin: "14:35",
    estado: "confirmado",
  },
  {
    orden: 4,
    titulo: "Conferencia: convenios, requisitos y movilidad",
    quien: "UTP Internacional",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "14:35",
    horaFin: "14:55",
    estado: "confirmado",
  },
  {
    orden: 5,
    titulo: "Panel de ex-becarios",
    quien: "Leslie Sánchez (UC Berkeley), Diego Mendoza (UC Berkeley)",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "14:55",
    horaFin: "15:25",
    estado: "confirmado",
  },
  {
    orden: 6,
    titulo: "Beca Fulbright",
    // Sin nombre de persona: la fuente ya no lo da (antes decía
    // "EducationUSA · Nikole Meza").
    quien: "EducationUSA",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "15:25",
    horaFin: "15:45",
    estado: "confirmado",
  },
  {
    orden: 7,
    titulo: "Intermedio y networking",
    quien: null,
    espacio: null,
    modalidad: "receso",
    horaInicio: "15:45",
    horaFin: "15:55",
    estado: "confirmado",
  },
  {
    orden: 8,
    titulo: "Cápsula",
    quien: "Mila (Japón)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "15:55",
    horaFin: "16:00",
    estado: "confirmado",
  },
  {
    orden: 9,
    titulo: "Beca MEXT",
    quien: "APEBEMO",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "16:00",
    horaFin: "16:20",
    estado: "confirmado",
  },
  {
    orden: 10,
    titulo: "Stand/ponencia",
    quien: "APEBEMO",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "16:20",
    horaFin: "16:40",
    estado: "confirmado",
  },
  {
    orden: 11,
    titulo: "Cápsula",
    // Pendiente de reconfirmar (ver comentario arriba y PLAN.md sección 8).
    quien: "Guillermo Gonzalo (Erasmus+)",
    espacio: null,
    modalidad: "vlog-zoom",
    horaInicio: "16:40",
    horaFin: "16:45",
    estado: "por-confirmar",
  },
  {
    orden: 12,
    titulo: "Erasmus Mundus",
    quien: "EMA Perú",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "16:45",
    horaFin: "17:05",
    estado: "confirmado",
  },
  {
    orden: 13,
    titulo: "Ponencia",
    quien: "Raquel Sánchez (conexión Erasmus Mundus)",
    espacio: null,
    modalidad: "zoom-vivo",
    horaInicio: "17:05",
    horaFin: "17:20",
    estado: "confirmado",
  },
  {
    orden: 14,
    titulo: "Migajeando Becas",
    quien: "Raúl Jauregui",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "17:20",
    horaFin: "17:40",
    estado: "confirmado",
  },
  {
    orden: 15,
    titulo: "Networking y mesas de consulta",
    quien: null,
    espacio: null,
    modalidad: "receso",
    horaInicio: "17:40",
    horaFin: "17:55",
    estado: "confirmado",
  },
  {
    orden: 16,
    titulo: "Cierre",
    quien: "LEAD UTP",
    espacio: null,
    modalidad: "presencial",
    horaInicio: "17:55",
    horaFin: "18:00",
    estado: "confirmado",
  },
];

export const bloques: CronogramaBloque[] = bloquesRaw.map((b) => CronogramaBloqueSchema.parse(b));

// El carril de stands corre en paralelo a todo el programa, durante
// todo el horario del evento (src/data/evento.ts).
const carrilParaleloRaw: CarrilParalelo = {
  titulo: "Stands abiertos",
  horaInicio: "14:00",
  horaFin: "18:00",
  quienes: ["UTP Internacional", "EducationUSA", "APEBEMO", "Migajeando Becas"],
  nota: "Requisitos, promedios, convalidación, visados y fechas de postulación. Aquí se resuelve lo oficial.",
  estado: "confirmado",
};

export const carrilParalelo: CarrilParalelo = CarrilParaleloSchema.parse(carrilParaleloRaw);
