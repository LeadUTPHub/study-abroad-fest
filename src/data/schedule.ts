import {
  FaqItemSchema,
  GateSchema,
  ScheduleBreakSchema,
  ScheduleGroupSchema,
  SpeakerSchema,
  type FaqItem,
  type Gate,
  type ScheduleBreak,
  type ScheduleGroup,
  type Speaker,
} from "./schema";
import stands from "./stands";

const groupsRaw: ScheduleGroup[] = [
  {
    n: 1,
    title: "Bienvenida y voces internacionales",
    from: "14:00",
    to: "14:35",
    rows: [
      { start: "14:00", end: "14:10", title: "Bienvenida", who: "LEAD UTP", mode: "presencial" },
      // TODO(confirmar): validar la modalidad de la participación de Ivanna.
      { start: "14:10", end: "14:15", title: "Cápsula", who: "Fernando Injoque (Purdue)", mode: "vlog-zoom" },
      { start: "14:15", end: "14:35", title: "Ponencia", who: "Ivanna (Purdue)", mode: "vlog-zoom" },
    ],
  },
  {
    n: 2,
    title: "Conferencia, panel y Fulbright",
    from: "14:35",
    to: "15:45",
    rows: [
      { start: "14:35", end: "14:55", title: "Conferencia: convenios, requisitos y movilidad", who: "UTP Internacional", mode: "presencial" },
      // TODO(confirmar): validar la modalidad del bloque de UC Berkeley.
      { start: "14:55", end: "15:25", title: "Panel de ex-becarios", who: "Leslie Sánchez, Diego Mendoza (UC Berkeley)", mode: "presencial" },
      { start: "15:25", end: "15:45", title: "Beca Fulbright", who: "EducationUSA", mode: "presencial" },
    ],
  },
  {
    n: 3,
    title: "Japón: Beca MEXT con APEBEMO",
    from: "15:55",
    to: "16:40",
    rows: [
      { start: "15:55", end: "16:00", title: "Cápsula", who: "Mila (Japón)", mode: "vlog-zoom" },
      // TODO(confirmar): quién presenta Beca MEXT y el bloque de APEBEMO.
      { start: "16:00", end: "16:20", title: "Beca MEXT", who: "APEBEMO", mode: "presencial" },
      { start: "16:20", end: "16:40", title: "APEBEMO", mode: "presencial" },
    ],
  },
  {
    n: 4,
    title: "Europa: Erasmus+ y Erasmus Mundus",
    from: "16:40",
    to: "17:20",
    rows: [
      // TODO(confirmar): "Guillermo Gonzalo" frente a "Guillermo Alfaro".
      { start: "16:40", end: "16:45", title: "Cápsula", who: "Guillermo Gonzalo (Erasmus+)", mode: "vlog-zoom" },
      { start: "16:45", end: "17:05", title: "Erasmus Mundus", who: "EMA Perú", mode: "presencial" },
      { start: "17:05", end: "17:20", title: "Conexión Erasmus Mundus", who: "Raquel Sánchez", mode: "zoom" },
    ],
  },
  {
    n: 5,
    title: "Migajeando Becas y cierre",
    from: "17:20",
    to: "18:00",
    rows: [
      { start: "17:20", end: "17:40", title: "Migajeando Becas", who: "Raúl Jauregui", mode: "presencial" },
      { start: "17:40", end: "17:55", title: "Networking y mesas de consulta", mode: "libre" },
      { start: "17:55", end: "18:00", title: "Cierre", who: "LEAD UTP", mode: "presencial" },
    ],
  },
];

export const groups = groupsRaw.map((group) => ScheduleGroupSchema.parse(group));

export const intermission: ScheduleBreak = ScheduleBreakSchema.parse({
  start: "15:45",
  end: "15:55",
  title: "Intermedio y networking",
});

// ---------------------------------------------------------------------------
// Ponentes (tarjetas tipo pase de abordaje). La hora es la de su actividad en
// el cronograma. Las charlas internacionales son siempre vlog + Zoom, nunca
// presencial (CLAUDE.md, regla 6). Panel y "experiencia": solo experiencia
// personal (regla 5).
// ---------------------------------------------------------------------------
const speakersRaw: Speaker[] = [
  { id: "fernando-injoque", initials: "FI", code: "US", name: "Fernando Injoque", institution: "Purdue University", mode: "vlog-zoom", time: "14:10", estado: "confirmado", imagen: "fernando-injoque.jpg" },
  // TODO(confirmar): modalidad de Ivanna. El diseño la muestra como "Experiencia personal".
  { id: "ivanna", initials: "I", code: "US", name: "Ivanna", institution: "Purdue University", mode: "vlog-zoom", time: "14:15", estado: "confirmado", imagen: "ivanna.png" },
  // TODO(confirmar): modalidad del bloque UC Berkeley.
  { id: "leslie-sanchez", initials: "LS", code: "US", name: "Leslie Sánchez", institution: "UC Berkeley", mode: "experiencia", time: "14:55", estado: "confirmado", imagen: "leslie-sanchez.png" },
  { id: "diego-mendoza", initials: "DM", code: "US", name: "Diego Mendoza", institution: "UC Berkeley", mode: "experiencia", time: "14:55", estado: "confirmado" },
  { id: "mila", initials: "M", code: "JP", name: "Mila", institution: "Desde Japón", mode: "vlog-zoom", time: "15:55", estado: "confirmado" },
  { id: "guillermo-gonzalo", initials: "GG", code: "EU", name: "Guillermo Gonzalo", institution: "Erasmus+", mode: "vlog-zoom", time: "16:40", estado: "confirmado", imagen: "guillermo-gonzalo.png" },
  { id: "raquel-sanchez", initials: "RS", code: "EU", name: "Raquel Sánchez", institution: "Conexión Erasmus Mundus", mode: "zoom", time: "17:05", estado: "confirmado" },
  // TODO(confirmar): el diseño usa el código "MUN", que no es un país. Sin sello hasta definirlo.
  { id: "raul-jauregui", initials: "RJ", code: null, name: "Raúl Jauregui", institution: "Migajeando Becas", mode: "experiencia", time: "17:20", estado: "confirmado" },
  // TODO(confirmar): si Lizbeth sigue participando.
  { id: "lizbeth-davila", initials: "LD", code: "CN", name: "Lizbeth Dávila", institution: "ELAP · SIAS", mode: "experiencia", time: "14:00", estado: "por-confirmar", imagen: "lizbeth-davila.JPG" },
];

export const speakers = speakersRaw.map((s) => SpeakerSchema.parse(s));

// ---------------------------------------------------------------------------
// Puertas de embarque = los 4 stands que sellan el pasaporte.
// ---------------------------------------------------------------------------
const gatesRaw: Gate[] = [
  { n: 1, standId: "utp-internacional", name: "UTP Internacional", color: "violet", estado: "confirmado" },
  { n: 2, standId: "educationusa", name: "EducationUSA", color: "magenta", estado: "confirmado" },
  { n: 3, standId: "apebemo", name: "APEBEMO", color: "road", estado: "confirmado" },
  { n: 4, standId: "migajeando-becas", name: "Migajeando Becas", color: "sky-deep", estado: "confirmado" },
];

export const gates = gatesRaw.map((g) => {
  const gate = GateSchema.parse(g);
  if (!stands.some((s) => s.id === gate.standId)) {
    throw new Error(`Puerta ${gate.n}: no existe el stand "${gate.standId}" en stands.ts`);
  }
  return gate;
});

/** Aliados del programa que se muestran bajo las puertas (sin logo ni descripción). */
export const allies = ["Erasmus+", "EMA Perú · Erasmus Mundus"] as const;

// ---------------------------------------------------------------------------
// FAQ de "Pase de abordaje": las 4 preguntas del diseño más la del Calendario
// de becas (PLAN.md, sección 4).
// ---------------------------------------------------------------------------
const faqRaw: FaqItem[] = [
  { pregunta: "¿Para quién es el evento?", respuesta: "Para estudiantes UTP, pensado principalmente para quienes están desde 5.º ciclo.", estado: "confirmado" },
  { pregunta: "¿Tiene costo?", respuesta: "No. Es gratis, con inscripción previa en Luma.", estado: "confirmado" },
  { pregunta: "¿Los ponentes internacionales van en persona?", respuesta: "No. Llegan en un vlog pregrabado y responden preguntas en vivo por Zoom.", estado: "confirmado" },
  { pregunta: "¿Dónde pregunto por requisitos de una beca?", respuesta: "En los stands. Los ponentes cuentan su experiencia personal, no los requisitos oficiales.", estado: "confirmado" },
  { pregunta: "¿Cómo consigo el Calendario de becas?", respuesta: "Recorre los stands, junta un sello en cada uno y canjéalos por un código en la mesa de canje. Con ese código lo desbloqueas en la web.", estado: "confirmado" },
];

export const faq = faqRaw.map((f) => FaqItemSchema.parse(f));
