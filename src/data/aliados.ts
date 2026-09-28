import { AliadoSchema, type Aliado } from "./schema";

// Confirmado (Embajada de Japón fuera hasta nuevo aviso — CLAUDE.md, regla 4).
const aliadosRaw: Aliado[] = [
  { nombre: "UTP Internacional", estado: "confirmado" },
  { nombre: "EducationUSA", estado: "confirmado" },
  { nombre: "Erasmus+", estado: "confirmado" },
  { nombre: "Erasmus Mundus (EMA Perú)", estado: "confirmado" },
];

const aliados: Aliado[] = aliadosRaw.map((a) => AliadoSchema.parse(a));

export default aliados;
