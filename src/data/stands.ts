import { StandSchema, type Stand } from "./schema";

// Confirmado: 4 stands sellan el pasaporte (PLAN.md, sección 4 y sección 8
// "Confirmar que son 4 stands..."). La Embajada de Japón no participa como
// institución; la Beca MEXT se presenta a través de APEBEMO (CLAUDE.md,
// regla 4).
const standsRaw: Stand[] = [
  {
    id: "utp-internacional",
    nombre: "UTP Internacional",
    descripcion: "Convenios, promedios requeridos, convalidación de cursos y visados.",
    logo: "Utplogonuevo.svg.webp",
    estado: "confirmado",
  },
  {
    id: "educationusa",
    nombre: "EducationUSA",
    descripcion: "Universidades, admisiones y becas para estudiar en Estados Unidos.",
    estado: "confirmado",
  },
  {
    id: "apebemo",
    nombre: "APEBEMO",
    descripcion: "Asociación Peruana de Becarios del Gobierno de Japón. A cargo de la Beca MEXT.",
    estado: "confirmado",
  },
  {
    id: "migajeando-becas",
    nombre: "Migajeando Becas",
    // Sin descripción propia en la fuente todavía; se muestra "Por anunciar".
    descripcion: null,
    estado: "confirmado",
  },
];

const stands: Stand[] = standsRaw.map((s) => StandSchema.parse(s));

export default stands;
