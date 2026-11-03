# Hoja de reglas de BioRuta

Cada regla y cada peso del motor tiene aquí su fila. Una regla no entra en `risk_config.json` sin su fila, y cada valor de `risk_config.json` lleva en su campo `regla` el identificador de la fila (por ejemplo `"regla": "R03"`).

Tipos: `normativa` (ley o reglamento), `guia` (guía oficial o científica) o `supuesto` (decisión nuestra, configurable, sin fuente). Si no encontramos fuente, la fila se queda como `supuesto` y se dice así en la app y en el README.

## Reglas

| ID | Regla | Valor en `risk_config.json` | Fuente | Cita o página | Tipo |
|---|---|---|---|---|---|
| R01 | Orden de visita según estado sanitario | `sin_incidencias` → `zona_vigilancia` → `sospechosa` → `positiva`; a igual estado, primero la granja más sensible (R04) | Sin fuente que fije el orden. El RD 306/2020 solo obliga a limitar y registrar las visitas | RD 306/2020, art. 5.2.h | supuesto |
| R02 | Horas sin visitar otra explotación tras estar en una granja positiva o sospechosa | 72 h (PPA). Para PRRS se usa el mismo valor hasta encontrar fuente | MAPA, Guía de campo para la lucha contra la PPA (13-02-2025) | Págs. 10 y 11 | guia |
| R03 | Medidas al salir de una granja: ducha, cambio de ropa, desinfección de calzado | Que cada medida reduce riesgo es normativa; cuánto (porcentaje) está por fijar | RD 306/2020 obliga a vestuario con zona limpia y sucia, ducha o equivalente, ropa y calzado exclusivos y pediluvios | RD 306/2020, art. 5.2.e, f, i y j | normativa (medidas) · supuesto (porcentajes) |
| R04 | Sensibilidad por tipo de granja | Orden: núcleo genético > multiplicación > maternidad > ciclo cerrado > transición > cebo. Valores por fijar | RD 306/2020 define los tipos. El orden sigue el flujo de animales de la pirámide (de selección hacia cebo): un brote arriba llega a todo lo de abajo | RD 306/2020, art. 3.2: a) selección, b) multiplicación, g) 2.º producción de lechones, g) 1.º ciclo cerrado, f) transición de lechones, h) cebo | normativa (tipos) · supuesto (orden y valores) |
| R05 | Riesgo que emite cada estado | Orden: positiva > sospechosa > zona de vigilancia > sin incidencias. Valores por fijar | Reglamento Delegado (UE) 2020/687: zona de protección de 3 km y de vigilancia de 10 km alrededor de un foco de PPA; las medidas duran 15 y 30 días | Reglamento (UE) 2020/687, anexos V, X y XI | normativa (estados y zonas) · supuesto (valores) |
| R06 | Cómo baja el riesgo con el tiempo desde la salida | Lineal hasta 0 al cumplirse las horas de R02 | Sin fuente. Se ata a R02 para que las dos reglas no se contradigan | | supuesto |
| R07 | Umbral de riesgo para entrar en una granja de sensibilidad alta (regla dura) | por fijar | Sin fuente localizada | | supuesto |
| R08 | Pesos α y β de la función de coste | por fijar | | | supuesto |
| R09 | Ventana de trazabilidad | Hacia atrás: 15 días desde la sospecha (PPA). Hacia delante: hasta hoy | Reglamento Delegado (UE) 2020/687: el rastreo cubre al menos el periodo de seguimiento del anexo II, contado hacia atrás desde la sospecha. Para PPA son 15 días | Reglamento (UE) 2020/687, art. 17.2 y anexo II | normativa (atrás) · supuesto (adelante y PRRS) |
| R10 | Estado de una granja con varios estados vigentes: el de mayor riesgo | el de mayor riesgo | | | supuesto |

R08 y R10 nacen como supuesto porque son decisiones de diseño del motor, no datos sanitarios. Si alguna fuente dice algo sobre ellas, se cambia el tipo.

Cuando una fila mezcla tipos, la parte con fuente es la que dice qué existe (tipos de granja, estados, medidas, ventana) y la parte supuesta son los números del motor. Ninguna fuente pública da porcentajes de reducción de riesgo por medida ni pesos por tipo de granja; esos valores son nuestros, configurables, y la app tiene que decirlo.

Notas de revisión (3 de noviembre de 2026):

- **R02:** las 72 horas están en las páginas 10 y 11 de la guía de campo del MAPA (comprobado a mano en el PDF). La guía habla de PPA; para PRRS el mismo valor es un supuesto. Como referencia, otras guías (no españolas) usan 48 horas entre granjas.
- **R03:** el anexo 2 de la guía de bioseguridad externa (IREC e INTERPORC, 2025) cita dos estudios que pueden dar orden de magnitud a las medidas: Otake et al. (2002), sobre transmisión del PRRS por botas y monos, y Simon-Grifé et al. (2013), sobre qué medidas consideran más importantes ganaderos y veterinarios españoles. No están leídos.
- **R01** sigue sin fuente. La lógica (visitar primero lo sano y dejar lo positivo para el final) es la habitual en bioseguridad, pero ningún documento leído lo dice así.

## Fuentes

Revisadas el 3 de noviembre de 2026.

| Fuente | Enlace | Estado | Reglas |
|---|---|---|---|
| Real Decreto 306/2020, normas básicas de ordenación de granjas porcinas intensivas (texto consolidado) | [BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2020-2110) | Leído: art. 3.2 (clasificación zootécnica) y art. 5.2 (bioseguridad: vestuario, ducha, visitas, ropa y calzado, pediluvios). No habla de horas de vacío ni de orden de visita | R01, R03, R04 |
| Reglamento Delegado (UE) 2020/687, prevención y control de enfermedades de categoría A | [EUR-Lex](https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32020R0687) | Leído: art. 8 (análisis de documentos, incluidas visitas), art. 17 (rastreo), anexo II (periodo de seguimiento: PPA 15 días), anexo V (radios de 3 y 10 km), anexos X y XI (duración de las zonas) | R05, R09 |
| MAPA, Guía de campo para la lucha contra la PPA (13-02-2025) | [PDF](https://www.mapa.gob.es/dam/mapa/contenido/ganaderia/temas/sanidad-animal-e-higiene-ganadera/sanidad-animal/enfermedades/porcino/ppa/20250213_guiadecampoppa.pdf) | Comprobado a mano: págs. 10 y 11, al menos 72 h antes de visitar otras explotaciones con especies sensibles | R02 |
| IREC e INTERPORC, Recomendaciones de bioseguridad externa frente a fauna. Anexo 2: ejemplo de informe y cuestionario para ganaderías porcinas intensivas (2025) | [PDF](https://servicio.mapama.gob.es/en/dam/jcr:be08b989-ae8f-4e23-bbb8-3220eda5a220/Anexo%202%20Ejemplo%20plan%20porcino%20intensivo.pdf) | Leído por encima: trata de fauna silvestre; sin horas ni orden de visita. Útil por sus referencias (Otake 2002, Simon-Grifé 2013) | R03 |
| MAPA e IREC, Guía de bioseguridad externa frente a fauna en porcino intensivo | [PDF](https://servicio.mapama.gob.es/en/dam/jcr:38715036-304f-44c1-8551-e5d7bfc8e676/Guia%20Bioseguridad%20externa%20frente%20a%20fauna%20en%20porcino%20intensivo.pdf) | Sin leer: pesa más de 10 MB y la herramienta no lo abre. Tiene un capítulo sobre visitas | R01, R02, R03 |
| MAPA, Manual práctico de operaciones en la lucha contra la PPA | [PDF (revisión de 2020)](https://servicio.mapama.gob.es/ca/ganaderia/temas/sanidad-animal-higiene-ganadera/manualpracticoppa_tcm34-428107.pdf) | Sin leer. Según el MAPA se actualizó en 2024 | R05, R09 |
| OMSA, Código Sanitario para los Animales Terrestres, cap. 15.1 (PPA) | [Web de la OMSA](https://woah.org/fileadmin/Home/eng/Health_standards/tahc/2024/en_chapitre_asf.htm) | Sin leer | R05, R09 |
| EFSA, opinión científica sobre PPA y explotaciones al aire libre (2021) | [PDF](https://www.efsa.europa.eu/sites/default/files/2021-06/6639.pdf) | Sin leer. No parece dar horas de vacío para personas | Contexto |
| Machado Lab, vehicle_rerouting_system | `referencias/` | Con notas en el proyecto | R04, R06, R08 |

Sin localizar todavía: guías de bioseguridad oficiales de Aragón y Cataluña, y las nuevas guías del MAPA de 2026 (solo hay noticias que las anuncian).
