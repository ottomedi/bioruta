# Hoja de reglas de BioRuta

Cada regla y cada peso del motor tiene aquí su fila. Una regla no entra en `risk_config.json` sin su fila, y cada valor de `risk_config.json` lleva en su campo `regla` el identificador de la fila (por ejemplo `"regla": "R03"`).

Tipos: `normativa` (ley o reglamento), `guia` (guía oficial o científica) o `supuesto` (decisión nuestra, configurable, sin fuente). Si no encontramos fuente, la fila se queda como `supuesto` y se dice así en la app y en el README.

## Reglas

| ID | Regla | Valor en `risk_config.json` | Fuente | Cita o página | Tipo |
|---|---|---|---|---|---|
| R01 | Orden de visita según estado sanitario | por fijar | por localizar | | |
| R02 | Horas de vacío tras visitar una granja positiva o sospechosa (y si dependen de la enfermedad) | por fijar | por localizar | | |
| R03 | Reducción de riesgo por cada medida (ducha, cambio de ropa, desinfección de calzado) | por fijar | por localizar | | |
| R04 | Sensibilidad por tipo de granja (núcleo genético, multiplicación, maternidad, ciclo cerrado, transición, cebo) | por fijar | por localizar | | |
| R05 | Riesgo que emite cada estado (positiva, sospechosa, zona de vigilancia, sin incidencias) | por fijar | por localizar | | |
| R06 | Cómo baja el riesgo con el tiempo desde la salida | por fijar | por localizar | | |
| R07 | Umbral de riesgo para entrar en una granja de sensibilidad alta (regla dura) | por fijar | por localizar | | |
| R08 | Pesos α y β de la función de coste | por fijar | | | supuesto |
| R09 | Ventana de trazabilidad (días hacia atrás desde el positivo y hacia delante) | por fijar | por localizar | | |
| R10 | Estado de una granja con varios estados vigentes: el de mayor riesgo | el de mayor riesgo | | | supuesto |

R08 y R10 nacen como supuesto porque son decisiones de diseño del motor, no datos sanitarios. Si alguna fuente dice algo sobre ellas, se cambia el tipo.

## Fuentes localizadas

Localizadas el 2 de noviembre de 2026. Ninguna está leída ni comprobada todavía: el día 2 hay que abrir cada una, comprobar que dice lo que creemos y apuntar la página en la fila que corresponda.

| Fuente | Enlace | Para qué reglas puede servir | Nota |
|---|---|---|---|
| Real Decreto 306/2020, normas básicas de ordenación de granjas porcinas intensivas | [BOE, texto consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2020-2110) · [página del MAPA](https://www.mapa.gob.es/ca/ganaderia/temas/bienestar-animal/bienestar-granja/bienestar-porcino-granja/rd-306-2020) | R01, R03 (plan de bioseguridad, visitas, vestuario) | Tiene corrección de errores ([BOE-A-2022-4206](https://boe.es/boe/dias/2022/03/17/pdfs/BOE-A-2022-4206.pdf)) y modificaciones posteriores. Usar el consolidado. |
| MAPA, Manual práctico de operaciones en la lucha contra la PPA | [PDF (revisión de 2020)](https://servicio.mapama.gob.es/ca/ganaderia/temas/sanidad-animal-higiene-ganadera/manualpracticoppa_tcm34-428107.pdf) | R02, R05, R09 (zonas, vigilancia, encuesta epidemiológica) | Según el MAPA se actualizó en 2024. Buscar la versión vigente. |
| MAPA, planes de contingencia | [PDF](https://servicio.mapa.gob.es/ca/ganaderia/temas/sanidad-animal-higiene-ganadera/planesdecontingencia_tcm34-512334.pdf) | R05, R09 | |
| MAPA e IREC, Guía de bioseguridad externa frente a fauna en porcino intensivo | [PDF](https://servicio.mapama.gob.es/en/dam/jcr:38715036-304f-44c1-8551-e5d7bfc8e676/Guia%20Bioseguridad%20externa%20frente%20a%20fauna%20en%20porcino%20intensivo.pdf) | R02, R03 (tiene un capítulo sobre visitas: antes, durante y después) | La más prometedora para las medidas. |
| Nuevas guías de bioseguridad frente a la PPA (MAPA, 2026) | [Noticia en Interempresas](https://www.interempresas.net/Agricola/651542-Publicadas-las-nuevas-guias-de-bioseguridad-frente-a-la-peste-porcina-africana-en-Espana.html) · [AgroNews Castilla y León](https://www.agronewscastillayleon.com/guias-bioseguridad-peste-porcina-africana-irec) | R02, R03 | Son noticias. Falta localizar el documento oficial en la web del MAPA. |
| MAPA, tríptico de bioseguridad porcina | [PDF](https://servicio.mapa.gob.es/en/ganaderia/temas/sanidad-animal-higiene-ganadera/tripticobioseguridadporcina_tcm38-111888.pdf) | R03 | Material divulgativo; mejor como apoyo que como fuente principal. |
| EFSA, opinión sobre el riesgo de PPA por pienso, cama y transporte | [Noticia de la EFSA](https://www.efsa.europa.eu/en/news/african-swine-fever-risks-feed-bedding-and-transport) | Contexto para el README (vehículos contaminados entre las vías de más riesgo) | Falta el enlace a la opinión completa. Buscar también opiniones de la EFSA sobre transmisión por personas y fómites. |
| OMSA, Código Sanitario para los Animales Terrestres, capítulo 15.1 (PPA) | [Capítulo en la web de la OMSA](https://woah.org/fileadmin/Home/eng/Health_standards/tahc/2024/en_chapitre_asf.htm) | R05, R09 (zonas de contención, periodo de incubación) | Edición de 2024. Hay un borrador de revisión en consulta en 2026. |
| Machado Lab, vehicle_rerouting_system | `referencias/` | R04, R06, R08 (modelo de riesgo entre granjas por rutas) | Ya está en el proyecto con notas. |

Sin localizar todavía: guías de bioseguridad oficiales de Aragón y Cataluña. La búsqueda general no las encuentra; hay que buscar directamente en las webs de sus departamentos de agricultura.
