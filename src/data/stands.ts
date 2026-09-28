import { StandSchema, type Stand } from "./schema";

// Confirmado (Embajada de Japón fuera hasta nuevo aviso — CLAUDE.md, regla 4).
const standsRaw: Stand[] = [
  {
    id: "utp-internacional",
    nombre: "UTP Internacional",
    descripcion: "Convenios, promedios requeridos, convalidación de cursos y visados.",
    estado: "confirmado",
  },
  {
    id: "educationusa",
    nombre: "EducationUSA",
    descripcion: "Universidades, admisiones y becas para estudiar en Estados Unidos.",
    estado: "confirmado",
  },
];

const stands: Stand[] = standsRaw.map((s) => StandSchema.parse(s));

export default stands;
