import { EventoSchema, type Evento } from "./schema";

const evento: Evento = EventoSchema.parse({
  nombre: "Study Abroad Fest",
  fecha: "2026-10-10",
  horaInicio: "09:00",
  horaFin: "13:31",
  lugar: "Convention Center UTP",
  direccion: "Jr. Hernán Velarde 260, Lima",
  zonaHoraria: "America/Lima",
  gratuito: true,
  inscripcionPrevia: true,
  lumaUrl: "https://luma.com/txyuybq9?tk=pwCvrY",
  organizadores: ["LEAD UTP · Pilar de Excelencia Académica", "UTP Internacional"],
  estado: "confirmado",
} satisfies Evento);

export default evento;
