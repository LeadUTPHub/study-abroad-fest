import { PonenteSchema, type Ponente } from "./schema";

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
    // Ya no aparece en el cronograma confirmado; pendiente de confirmar si
    // sigue participando (PLAN.md, sección 8). No se borra su ficha.
    estado: "por-confirmar",
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
    id: "ivanna",
    nombre: "Ivanna",
    institucion: "Purdue University",
    codigoPais: "US",
    meta: "Estados Unidos",
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "mila",
    nombre: "Mila",
    // Solo se da el nombre y el país en la fuente (PLAN.md).
    institucion: null,
    codigoPais: "JP",
    meta: "Japón",
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "guillermo-gonzalo",
    // Reemplaza a "Guillermo Alfaro" (PLAN.md, sección 8: pendiente de
    // reconfirmar cuál de los dos nombres es correcto).
    nombre: "Guillermo Gonzalo",
    institucion: "Erasmus",
    codigoPais: "EU",
    meta: "Europa",
    grupo: "internacional",
    estado: "por-confirmar",
  },
  {
    id: "raquel-sanchez",
    nombre: "Raquel Sánchez",
    // Ni institución ni país se dan en la fuente.
    institucion: null,
    codigoPais: null,
    meta: null,
    grupo: "internacional",
    estado: "confirmado",
  },
  {
    id: "leslie-sanchez",
    nombre: "Leslie Sánchez",
    institucion: "UC Berkeley",
    codigoPais: "US",
    meta: "Beca culminada",
    grupo: "panel",
    estado: "confirmado",
  },
  {
    id: "diego-mendoza",
    nombre: "Diego Mendoza",
    institucion: "UC Berkeley",
    codigoPais: "US",
    meta: "Estados Unidos",
    // Pasó del grupo "internacional" al panel de ex-becarios en el
    // cronograma confirmado.
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
    // Ya no aparece en el cronograma confirmado; pendiente de confirmar si
    // sigue participando (PLAN.md, sección 8). No se borra su ficha.
    estado: "por-confirmar",
  },
];

const ponentes: Ponente[] = ponentesRaw.map((p) => PonenteSchema.parse(p));

export default ponentes;
