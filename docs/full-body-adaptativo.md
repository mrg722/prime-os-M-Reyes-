# Full Body A/B · Adaptativo 2D (semanas 1-12)

Modo 2 días de Prime OS. Solo cambia `data/v9/adaptiveFullBody_1..12.json` y el motor adaptativo 2D
(`js/volumeEngine.js`). Las rutinas Excel de 3 y 4 días (`routine3_*`, `routine4_*`, `data/v9/source/*`) no se tocan.

## Por qué está diseñado así (evidencia)

| Pregunta | Qué dice la evidencia | Cómo se aplica aquí |
|---|---|---|
| ¿Cuántas series por músculo? | Relación dosis-respuesta: más series semanales → más hipertrofia; ≥10 series/semana rindió más que <5 o 5-9 ([Schoenfeld et al., 2017](https://pubmed.ncbi.nlm.nih.gov/27433992/)). El meta-análisis más grande (67 estudios, 2.058 personas) confirma que el volumen sube hipertrofia y fuerza, con rendimientos decrecientes, mucho más marcados en fuerza; cuenta las series indirectas como 0,5 ("fraccionales") ([Pelland et al., 2024/2025](https://pubmed.ncbi.nlm.nih.gov/41343037/), [preprint](https://sportrxiv.org/index.php/server/preprint/view/460)). | Series directas dentro de los rangos del dashboard 3D del Excel y subiendo por bloque (≈48 → 58 → 61 series/semana de media). |
| ¿Cuántas series por sesión? | Por sesión también hay rendimientos decrecientes: sin superioridad detectable pasadas ~11 series fraccionales por músculo y sesión (hipertrofia) y ~2 series directas (fuerza) ([Remmert et al., 2025](https://sportrxiv.org/index.php/server/preprint/view/537)). | Máximo 4-5 series directas por músculo y sesión; el volumen se reparte entre A y B. |
| ¿2 días alcanzan? | Con volumen igualado, la frecuencia no cambia de forma relevante la hipertrofia ([Schoenfeld, Grgic & Krieger, 2019](https://pubmed.ncbi.nlm.nih.gov/30558493/)); frecuencia ≥2/semana por músculo supera a 1/semana cuando no se iguala el volumen ([Schoenfeld, Ogborn & Krieger, 2016](https://pubmed.ncbi.nlm.nih.gov/27102172/)). Para fuerza la frecuencia sí suma (Pelland et al.). | Cada grupo se entrena 2 veces por semana (A y B), con los básicos pesados repartidos para que cada anclaje se practique cada semana. |
| ¿Qué tan cerca del fallo? | La hipertrofia mejora al acercarse al fallo, la fuerza casi no depende del RIR ([Robinson et al., 2024](https://pubmed.ncbi.nlm.nih.gov/38970765/)); el fallo real aporta una ventaja trivial frente a no llegar ([Refalo et al., 2023](https://pubmed.ncbi.nlm.nih.gov/36334240/)). | Compuestos RIR 2-3 (bloque 1) → RIR 1-2 (bloques 2-3); aislamientos RIR 0-2; nunca fallo en básicos pesados. |
| ¿Cómo descargar? | Consenso Delphi: la descarga es un periodo corto de menor estrés para disipar fatiga y preparar lo siguiente; en la práctica ~1 semana cada 4-8 semanas, bajando sobre todo el volumen y la cercanía al fallo, con los mismos ejercicios ([Bell et al., 2023](https://link.springer.com/article/10.1186/s40798-023-00633-0); [Bell et al., 2024 encuesta](https://pubmed.ncbi.nlm.nih.gov/38499934/)). | S4 y S8: 54-60 % de las series de la semana previa (deltoides/brazos ≤ 70 %), cargas de pivot del Excel y RIR 3-4, mismos ejercicios. S12: 60-75 % de S11 con test submáximo. |
| ¿Cómo progresar? | Sobrecarga progresiva por doble progresión (reps → carga) y top set + backoff, como plantea el Excel. | Anclajes fijos dentro de cada bloque; carga del Excel semana a semana; el motor sugiere +2,5 % o +1 rep solo si lo registrado lo justifica. |

## Estructura de las sesiones

Compuestos primero; laterales + curl y laterales polea + pushdown en superserie para que la sesión quede en ~60-80 min.

- **Full Body A**: Press plano barra · Dominadas lastradas · Prensa 45/hack · RDL barra · Remo pecho apoyado · Aperturas polea (S5-S12, salvo S8) · Elevaciones laterales · Curl martillo.
- **Full Body B**: Press inclinado DB · Remo frontal/Hammer · Sentadilla búlgara · Hip thrust · Curl femoral sentado · Extensión de rodilla · Elevación lateral polea · Pushdown tríceps.

Ambas sesiones tienen cuádriceps + bisagra/glúteo (A: prensa + RDL; B: búlgara + hip thrust + curl femoral + extensión).
Semi-sumo queda fuera: en el Excel es solo opcional técnico.

## Series directas por semana (A + B) vs rango del dashboard 3D

| Semana | Fase | Pecho | Espalda | Cuád. | Fem/glúteo | Deltoides | Brazos | Total | A / B |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Reacumulación técnica | 8 (8-10) | 10 (10-12) | 8 (8-10) | 8 (8-10) | 6 (6-8) | 4 (4-6) | 44 | 22 / 22 |
| 2 | Reacumulación técnica | 9 | 11 | 9 | 9 | 7 | 5 | 50 | 26 / 24 |
| 3 | Reacumulación técnica | 10 | 11 | 9 | 10 | 7 | 5 | 52 | 27 / 25 |
| 4 | Pivot 1 (50-60 % S3) | 6 (60 %) | 6 (55 %) | 5 (56 %) | 6 (60 %) | 4 (57 %) | 3 (60 %) | 30 | 15 / 15 |
| 5 | Construcción fuerte | 10 (10-12) | 12 (12-14) | 10 (10-12) | 10 (10-12) | 8 (8-10) | 6 (6-8) | 56 | 28 / 28 |
| 6 | Construcción fuerte | 11 | 12 | 10 | 11 | 8 | 6 | 58 | 29 / 29 |
| 7 | Construcción fuerte III | 11 | 13 | 10 | 11 | 8 | 7 | 60 | 31 / 29 |
| 8 | Pivot 2 (50-60 % S7) | 6 (55 %) | 7 (54 %) | 6 (60 %) | 6 (55 %) | 5 (63 %) | 4 (57 %) | 34 | 18 / 16 |
| 9 | Intensificación productiva | 11 (10-13) | 12 (12-15) | 10 (10-13) | 11 (10-13) | 8 (8-11) | 6 (6-9) | 58 | 29 / 29 |
| 10 | Intensificación productiva | 11 | 13 (13-15) | 11 | 11 | 9 (9-11) | 7 | 62 | 32 / 30 |
| 11 | Intensificación / rep PR | 11 | 13 (13-15) | 11 | 11 | 9 (9-11) | 7 | 62 | 32 / 30 |
| 12 | Consolidación / test (60-75 % S11) | 7 (6-9) | 9 (8-11) | 7 (6-9) | 7 (6-9) | 6 (5-8) | 5 (4-6) | 41 | 21 / 20 |

Cuentan solo series directas (el músculo principal del ejercicio, como el Excel). Indirectas no contadas: los remos y
dominadas suman bíceps y deltoide posterior; los press, tríceps; búlgara y prensa, glúteo.

## Anclajes (carga del Excel de esa semana · series · RIR)

| Sem. | Press plano barra | Press inclinado DB | Dominadas lastradas | Prensa 45/hack | RDL barra | Hip thrust |
|---|---|---|---|---|---|---|
| 1 | 80 kg · 4×6-8 · RIR 2-3 | 34-36 kg · 4×6-10 · RIR 2-3 | +20/+25 · 4×5-8 · RIR 2-3 | 210-230 · 4×8-10 · RIR 2-3 | 120-130 · 3×6-8 · RIR 2-3 | 140-155 · 3×8-12 · RIR 2-3 |
| 2 | 80-82,5 · 5×8-10 | 35-37,5 · 4×6-10 | +25 · 4×5-8 | 220-235 · 4×8-10 | 125-135 · 3×6-8 | 150-160 · 3×8-12 |
| 3 | 82,5 · 5×8-10 · RIR 2 | top 37,5 / bo 35 · 1+4 | +25/+27,5 · 4×6-8 · RIR 2 | 230-245 · 4×8-10 | 135-140 · 4×6-8 | 155-165 · 3×8-12 |
| 4 | 70-75 · 3×8-10 · RIR 3-4 | 30-32 · 3×8-10 · RIR 3-4 | BW/+10 · 2×6-8 | 180-205 · 2×10 | 100-115 · 2×6-8 · RIR 4 | 120-135 · 2×10 |
| 5 | 82,5-85 · 4×8-10 · RIR 2 | top 37,5-40 / bo 35-37,5 · 1+3 | top +27,5/+30 / bo +20-25 · 1+3 | top 235-250 / bo 215-230 · 1+3 | 140-145 · 4×6-8 | 160-170 · 3×8-10 |
| 6 | 85 · 4×8-10 · RIR 1-2 | top 40 si verde · 1+3 | top +30 si verde · 1+3 | top 245-260 / bo 225-240 · 1+3 | 145-150 · 4×6-8 | 165-175 · 4×8-10 |
| 7 | 85 · 4×8-10 | top 40 / bo 35-37,5 · 1+3 | top +30 / bo +22,5-25 · 1+4 | top 250-265 / bo 230-245 · 1+3 | 145-155 · 4×6-8 | 170-180 · 4×8-10 |
| 8 | 70-75 · 3×8-10 · RIR 3-4 | 30-34 · 3×8-10 · RIR 3-4 | BW/+10 · 3×6-8 | 180-210 · 3×10 | 100-120 · 2×6-8 · RIR 4 | 125-140 · 2×10 |
| 9 | 85-87,5 · 4×8-10 | top 40 / bo 35-37,5 · 1+3 | top +30 / bo +25 · 1+3 | top 255-270 / bo 230-245 · 1+3 | top 150-155 / bo 135-145 · 1+3 | 170-180 · 4×8-10 |
| 10 | 85-87,5 · 4×8-10 | top 40-42,5 / bo 37,5 · 1+3 | top +30 / bo +25 · 1+4 | top 260-270 / bo 235-250 · 1+3 | top 150-160 / bo 140-145 · 1+3 | 175-185 · 4×8-10 |
| 11 | 85-90 · 4×8-10 | 40 o 42,5 AMRAP técnico RIR 1 · 1+3 | +30 AMRAP técnico RIR 1 · 1+4 | top 260-275 AMRAP técnico · 1+3 | top 155-160 / bo 140-150 · 1+3 | 175-185 · 4×8-10 · RIR 1 |
| 12 | 80-82,5 · 2×6-8 · RIR 2-3 | test 40 RIR 1 · 1+2 | test +25/+30 RIR 1 · 1+2 | test 250-270 RIR 1 · 1+2 | 140-150 · 2×5-8 · RIR 2 | test 170-180 RIR 1 · 1+2 |

Bloques 2-3: top RIR 1-2 y backoff RIR 2 (salvo indicación). Remo frontal/Hammer sigue el Excel 3D (100 → 110-125 kg),
búlgara 25 → 30-34 kg/mano, curl femoral y extensión en lbs como en el Excel.

## Reglas de progresión

1. **Semana a semana manda el plan**: usa la carga del Excel de esa semana. Dentro de cada bloque los anclajes no cambian.
2. **Doble progresión** (series rectas): si todas las series llegan al tope del rango con RIR ≥ objetivo, +2,5 kg la
   próxima exposición; si no, repetir carga y sumar reps.
3. **Top set + backoff**: el top es la serie pesada del día; los backoff van ~8-10 % debajo. Si superas el rango del
   top con RIR ≥ objetivo, +2,5 kg (o +1 rep en lastre/mancuernas).
4. **Pivots (S4, S8)**: mismas máquinas, menos series, carga liviana, RIR 3-4. No se progresa.
5. **S12**: un top set técnico (RIR 1, sin 1RM) y backoffs cómodos para comparar con S1.

### Motor adaptativo (lo que hace la app en modo 2D)

Para cada ejercicio de la semana N mira lo registrado en la semana N-1 (sesiones 2D, sin calentamientos) y lo compara
con lo prescrito (RIR objetivo guardado en la sesión y rango de reps de la semana N-1):

| Situación registrada | Ajuste en la semana N |
|---|---|
| Dolor ≥ 4/10 en alguna serie | −5 % de carga (si es barra/máquina) y técnica limpia |
| Semana N es pivot, o N-1 fue pivot | Se respeta la carga del plan |
| RIR medio más de 1 punto bajo el objetivo | −5 % (o bajar un escalón) |
| RIR medio bajo el objetivo | Repetir carga |
| Todas las series en el tope del rango con RIR ≥ objetivo | +2,5 % si el plan no sube ya esa semana; en lastre, mancuernas o cargas < 80 → +1 rep por serie |
| Tope de reps sin RIR anotado | +1 rep por serie (y anotar RIR) |
| No llegó al mínimo del rango / dentro del rango | Repetir carga y sumar reps |
| Sin registro previo | Sin cambios |

El ajuste se calcula siempre desde la base 2D (plan + ediciones manuales en Rutina) y se muestra solo en la vista
activa, con una nota "Ajuste Semana N-1: …". Nunca se guarda sobre la base, por lo que recargar o cambiar de
modo/semana no acumula ajustes. Al editar un ejercicio en Rutina se guarda la edición, pero no el ajuste automático.
