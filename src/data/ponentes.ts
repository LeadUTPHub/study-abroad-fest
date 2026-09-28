import { PonenteSchema, type Ponente } from "./schema";

// Confirmados; fotos pendientes (PLAN.md, sección 4, fila "Ponentes").
// Cuando lleguen las fotos autorizadas (PLAN.md, sección 6), se agrega
// `imagen: "carmen.jpg"` (etc.) apuntando a src/assets/ponentes/.
const ponentesRaw: Ponente[] = [
  {
    id: "carmen",
    nombre: "Carmen",
    institucion: "Tecnológico de Monterrey",
    codigoPais: "MX",
    meta: "México",
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "fernando-injoque",
    nombre: "Fernando Injoque",
    institucion: "Purdue University",
    codigoPais: "US",
    meta: "Estados Unidos",
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "guillermo-alfaro",
    nombre: "Guillermo Alfaro",
    institucion: "Erasmus",
    codigoPais: "EU",
    meta: "Europa",
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "diego-mendoza",
    nombre: "Diego Mendoza",
    institucion: "UC Berkeley",
    codigoPais: "US",
    meta: "Estados Unidos",
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "leslie",
    nombre: "Leslie",
    institucion: "UC Berkeley",
    codigoPais: "US",
    meta: "Beca culminada",
    grupo: "panel",
    estado: "confirmado",
  },
  {
    id: "lizbeth-davila",
    nombre: "Lizbeth Dávila",
    institucion: "ELAP · SIAS",
    codigoPais: "CN",
    meta: "China",
    grupo: "panel",
    estado: "confirmado",
  },
];

const ponentes: Ponente[] = ponentesRaw.map((p) => PonenteSchema.parse(p));

export default ponentes;
