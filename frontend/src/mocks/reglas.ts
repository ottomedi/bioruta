import type { Regla } from '../api/types'

/**
 * La hoja de reglas de docs/reglas.md tal como la devolvería GET /reglas.
 *
 * El contrato admite un solo tipo y un solo enlace por regla. Cuando una fila
 * mezcla tipos, va el más débil (supuesto si alguna parte lo es) y el texto de
 * `fuente` dice qué parte tiene respaldo: es el único caso de supuesto con
 * fuente. Un supuesto puro lleva `fuente` nula. El enlace es el del documento
 * principal; el resto de fuentes se nombran en el texto. `valor` va en texto:
 * desde la versión 2 de la hoja el motor usa órdenes y horas, no pesos.
 */

const EURLEX_2020_687 = 'https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32020R0687'
const MAPA_GUIA_PPA =
  'https://www.mapa.gob.es/dam/mapa/contenido/ganaderia/temas/sanidad-animal-e-higiene-ganadera/sanidad-animal/enfermedades/porcino/ppa/20250213_guiadecampoppa.pdf'
const AHDB_PERSONAS = 'https://ahdb.org.uk/knowledge-library/biosecurity-people-on-pig-farms'
const ALBERTA_VISITANTES =
  'https://www1.agric.gov.ab.ca/$Department/deptdocs.nsf/all/cpv10708/$FILE/biosecurity_notes_colour_2010_09_01.pdf'
const NC_DENR_2008 = 'https://www.deq.nc.gov/biosecurity-guidelines-20080930pdf/open'
const PITKIN_2011 = 'https://www.aasv.org/shap/issues/v19n6/v19n6p345.html'
const MACHADO_LAB = 'https://github.com/machado-lab/vehicle_rerouting_system'

export const REGLAS: readonly Regla[] = [
  {
    id: 'R01',
    descripcion: 'Orden de visita según el estado sanitario',
    valor:
      'Sin incidencias → zona de vigilancia → sospechosa → positiva; a igual estado, primero la granja más sensible (R04).',
    fuente:
      'Las guías piden visitar primero los grupos más sanos y al final los que tienen problemas sanitarios, y la granja con un problema sospechado la última. El orden entre vigilancia, sospechosa y positiva sale de R05.',
    url: ALBERTA_VISITANTES,
    cita: 'Gobierno de Alberta, «Biosecurity Basics for visitors to livestock operations» (2010), punto 3. Michigan State University Extension, E-2842 (2003).',
    tipo: 'guia',
  },
  {
    id: 'R02',
    descripcion: 'Horas sin visitar otra granja tras estar en una positiva o sospechosa',
    valor: 'PPA: 72 h. PRRS: 15 h (una noche), siempre con las medidas de R03.',
    fuente:
      'PPA: MAPA, Guía de campo para la lucha contra la PPA (2025). PRRS: Pitkin, Otake y Dee (2011), una noche sin contacto evitó el contagio durante 4 años; AHDB pide un mínimo de 15 h.',
    url: MAPA_GUIA_PPA,
    cita: 'MAPA, págs. 10 y 11. Pitkin et al., J Swine Health Prod 19(6):345-348. AHDB, «Biosecurity: People on pig farms».',
    tipo: 'guia',
  },
  {
    id: 'R03',
    descripcion:
      'Medidas al salir de una granja: ducha, cambio de ropa y botas y desinfección del calzado',
    valor:
      'Obligatorias en cada salida. Con todas, cuentan las horas de R02; si falta alguna, la siguiente visita es una exposición.',
    fuente:
      'El RD 306/2020 las hace obligatorias (normativa). En PRRS, ducharse y cambiarse de ropa y botas con una noche de espera evitó el contagio, y sin esas medidas sí lo hubo (Pitkin et al. 2011, guía).',
    url: PITKIN_2011,
    cita: 'RD 306/2020, art. 5.2.e, f, i y j. Pitkin et al. 2011.',
    tipo: 'guia',
  },
  {
    id: 'R04',
    descripcion: 'Sensibilidad por tipo de granja',
    valor:
      'Núcleo genético > multiplicación > maternidad = ciclo cerrado > transición > cebo (posiciones, no números).',
    fuente:
      'Las visitas siguen la pirámide de producción: siempre primero núcleos y multiplicadores, luego granjas de cerdas, transición y cebo (guía). El RD 306/2020 define los tipos (normativa). El ciclo cerrado va con la maternidad porque también es una granja de cerdas.',
    url: NC_DENR_2008,
    cita: 'North Carolina DENR, memorándum de bioseguridad (30-09-2008), «Scheduling». 3tres3, de Andrés et al. (2008). AHDB. RD 306/2020, art. 3.2.',
    tipo: 'guia',
  },
  {
    id: 'R05',
    descripcion: 'Riesgo que emite cada estado sanitario',
    valor: 'Positiva > sospechosa > zona de vigilancia > sin incidencias (orden, no números).',
    fuente:
      'Reglamento Delegado (UE) 2020/687: zona de protección de 3 km y de vigilancia de 10 km alrededor de un foco, durante 15 y 30 días; ante una sospecha se aplican medidas de inmediato.',
    url: EURLEX_2020_687,
    cita: 'Reglamento (UE) 2020/687, art. 5 y 7 y anexos V, X y XI.',
    tipo: 'normativa',
  },
  {
    id: 'R06',
    descripcion: 'Cómo baja el riesgo con el tiempo desde la salida',
    valor: 'En escalón: hay riesgo hasta cumplir las horas de R02 y después es cero.',
    fuente:
      'Las fuentes de R02 hablan de tiempos de espera que se cumplen o no, nunca de una bajada gradual.',
    url: MAPA_GUIA_PPA,
    cita: 'Las de R02.',
    tipo: 'guia',
  },
  {
    id: 'R07',
    descripcion: 'Regla dura para entrar en una granja',
    valor:
      'Núcleo genético: no se entra con menos de 72 h desde el último contacto con cerdos, de cualquier granja. Resto de tipos: una noche (15 h).',
    fuente:
      'AHDB: al menos 15 h sin cerdos, y 72 h en núcleos genéticos. National Pork Board: como mínimo una noche entre visitas, y más en granjas de alto estatus.',
    url: AHDB_PERSONAS,
    cita: 'AHDB, «Biosecurity: People on pig farms», apartado para visitantes. National Pork Board (2016).',
    tipo: 'guia',
  },
  {
    id: 'R08',
    descripcion: 'Cómo combina el motor las reglas',
    valor:
      'Sin pesos, por prioridades: 1) reglas duras (R07), 2) estado (R01), 3) sensibilidad (R04), 4) a igualdad de todo, la granja más cercana.',
    fuente:
      'Machado Lab (NC State) ordena vehículos con reglas jerárquicas, sin pesos. El paso 4 no es una regla sanitaria: entre granjas con el mismo estado y la misma sensibilidad ninguna fuente marca un orden, porque cualquiera es igual de seguro. Elegimos la más cercana para ahorrar kilómetros; no cambia el riesgo.',
    url: MACHADO_LAB,
    cita: 'Machado Lab, score_template.R. Galvis, Corzo y Machado, Prev Vet Med 244:106650 (2025).',
    tipo: 'guia',
  },
  {
    id: 'R09',
    descripcion: 'Ventana de trazabilidad',
    valor:
      'Hacia atrás: PPA, 15 días desde la sospecha; PRRS, 14 días. Hacia delante: todo lo que salió de la granja hasta hoy.',
    fuente:
      'El Reglamento Delegado (UE) 2020/687 manda rastrear lo expedido al establecimiento y desde él, y hacia atrás el periodo de seguimiento: 15 días en PPA (normativa). Para PRRS, la OMSA fija una incubación de 14 días (guía).',
    url: EURLEX_2020_687,
    cita: 'Reglamento (UE) 2020/687, art. 17 y anexo II. OMSA, Código Terrestre, art. 15.1.1 y 15.3.1.',
    tipo: 'guia',
  },
  {
    id: 'R10',
    descripcion: 'Estado de una granja con varios estados vigentes',
    valor: 'El de mayor riesgo según R05. Una sospecha de PPA vigente manda hasta que se descarte.',
    fuente:
      'Con fuente: ante la sospecha de una enfermedad de categoría A, como la PPA, las medidas se aplican de inmediato y duran hasta que la autoridad la descarta (normativa). Supuesto: las combinaciones sin PPA, porque el PRRS no es de categoría A.',
    url: EURLEX_2020_687,
    cita: 'Reglamento (UE) 2020/687, art. 5 y 7.',
    tipo: 'supuesto',
  },
]
