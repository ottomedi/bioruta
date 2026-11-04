import type { Regla } from '../api/types'

/**
 * La hoja de reglas de docs/reglas.md tal como la devolvería GET /reglas.
 *
 * El contrato admite un solo tipo y un solo enlace por regla. Cuando una fila
 * mezcla tipos, va el más débil (supuesto si alguna parte lo es) y el texto de
 * `fuente` dice qué parte tiene respaldo: es el único caso de supuesto con
 * fuente. Un supuesto puro lleva `fuente` nula. El enlace es el del documento
 * principal; el resto de fuentes se nombran en el texto. `valor` va en texto
 * porque los números de risk_config.json aún están por fijar.
 */

const BOE_RD_306 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-2110'
const EURLEX_2020_687 = 'https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32020R0687'
const MAPA_GUIA_PPA =
  'https://www.mapa.gob.es/dam/mapa/contenido/ganaderia/temas/sanidad-animal-e-higiene-ganadera/sanidad-animal/enfermedades/porcino/ppa/20250213_guiadecampoppa.pdf'
const AHDB_PERSONAS = 'https://ahdb.org.uk/knowledge-library/biosecurity-people-on-pig-farms'

export const REGLAS: readonly Regla[] = [
  {
    id: 'R01',
    descripcion: 'Orden de visita según el estado sanitario',
    valor:
      'Sin incidencias → zona de vigilancia → sospechosa → positiva; a igual estado, primero la granja más sensible (R04).',
    // Ninguna fuente fija el orden: el RD 306/2020 (art. 5.2.h) solo obliga a limitar y registrar las visitas.
    fuente: null,
    url: null,
    cita: null,
    tipo: 'supuesto',
  },
  {
    id: 'R02',
    descripcion: 'Horas sin visitar otra granja tras estar en una positiva o sospechosa',
    valor: 'PPA: 72 h. PRRS: 15 h (una noche), siempre con ducha y cambio de ropa y botas (R03).',
    fuente:
      'PPA: MAPA, Guía de campo para la lucha contra la PPA (2025). PRRS: Pitkin, Otake y Dee (2011), una noche sin contacto evitó el contagio durante 4 años; AHDB pide un mínimo de 15 h.',
    url: MAPA_GUIA_PPA,
    cita: 'MAPA, págs. 10 y 11. Pitkin et al., J Swine Health Prod 19(6):345-348. AHDB, «Biosecurity: People on pig farms».',
    tipo: 'guia',
  },
  {
    id: 'R03',
    descripcion: 'Medidas al salir de una granja: ducha, cambio de ropa y desinfección del calzado',
    valor: 'Cada medida reduce el riesgo; cuánto (porcentaje) está por fijar.',
    fuente:
      'Con fuente: el RD 306/2020 obliga a vestuario con zona limpia y sucia, ducha, ropa y calzado exclusivos y pediluvios (normativa), y en PRRS la ducha y el cambio de ropa y botas evitaron el contagio (Pitkin et al. 2011, guía). Supuesto: los porcentajes.',
    url: BOE_RD_306,
    cita: 'RD 306/2020, art. 5.2.e, f, i y j. Pitkin et al. 2011.',
    tipo: 'supuesto',
  },
  {
    id: 'R04',
    descripcion: 'Sensibilidad por tipo de granja',
    valor:
      'Núcleo genético > multiplicación > maternidad > ciclo cerrado > transición > cebo. Valores por fijar.',
    fuente:
      'Con fuente: el RD 306/2020 define los tipos (normativa) y AHDB pone el núcleo genético aparte, con 72 h sin cerdos frente a 15 h (guía). Supuesto: el resto del orden, que sigue el flujo de animales de la pirámide, y los valores.',
    url: BOE_RD_306,
    cita: 'RD 306/2020, art. 3.2. AHDB, «Biosecurity: People on pig farms».',
    tipo: 'supuesto',
  },
  {
    id: 'R05',
    descripcion: 'Riesgo que emite cada estado sanitario',
    valor: 'Positiva > sospechosa > zona de vigilancia > sin incidencias. Valores por fijar.',
    fuente:
      'Con fuente: el Reglamento Delegado (UE) 2020/687 fija la zona de protección de 3 km y la de vigilancia de 10 km alrededor de un foco de PPA, durante 15 y 30 días (normativa). Supuesto: los valores.',
    url: EURLEX_2020_687,
    cita: 'Reglamento (UE) 2020/687, anexos V, X y XI.',
    tipo: 'supuesto',
  },
  {
    id: 'R06',
    descripcion: 'Cómo baja el riesgo con el tiempo desde la salida',
    valor: 'Lineal hasta 0 al cumplirse las horas de R02.',
    fuente: null,
    url: null,
    cita: null,
    tipo: 'supuesto',
  },
  {
    id: 'R07',
    descripcion: 'Regla dura para entrar en una granja de sensibilidad alta',
    valor:
      'Núcleo genético: no se entra con menos de 72 h desde el último contacto con cerdos, de cualquier granja. Resto de tipos: umbral por fijar.',
    fuente:
      'Con fuente: las 72 h para núcleos genéticos de AHDB (guía). Supuesto: el umbral del resto de tipos.',
    url: AHDB_PERSONAS,
    cita: 'AHDB, «Biosecurity: People on pig farms», apartado para visitantes.',
    tipo: 'supuesto',
  },
  {
    id: 'R08',
    descripcion: 'Pesos α y β de la función de coste',
    valor: 'Por fijar.',
    fuente: null,
    url: null,
    cita: null,
    tipo: 'supuesto',
  },
  {
    id: 'R09',
    descripcion: 'Ventana de trazabilidad',
    valor: 'Hacia atrás: 15 días desde la sospecha (PPA). Hacia delante: hasta hoy.',
    fuente:
      'Con fuente: hacia atrás, el Reglamento Delegado (UE) 2020/687 manda rastrear el periodo de seguimiento, 15 días en PPA, que coinciden con la incubación de la OMSA (normativa). Supuesto: hacia delante y en PRRS.',
    url: EURLEX_2020_687,
    cita: 'Reglamento (UE) 2020/687, art. 17.2 y anexo II. OMSA, Código Terrestre, art. 15.1.1.',
    tipo: 'supuesto',
  },
  {
    id: 'R10',
    descripcion: 'Estado de una granja con varios estados vigentes',
    valor: 'El de mayor riesgo.',
    fuente: null,
    url: null,
    cita: null,
    tipo: 'supuesto',
  },
]
