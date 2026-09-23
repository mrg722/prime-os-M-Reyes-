# Prime OS - Martin Reyes V8.2

## Qué es

Prime OS es una plataforma personal de entrenamiento para registrar rutina, series, reps, RIR/RPE, descanso, dolor, fatiga, progreso semanal, cardio y peso corporal.

## Objetivo

Automatizar el seguimiento del bloque de entrenamiento de Martin Reyes para tomar mejores decisiones de carga, volumen, progreso y recuperación.

## Cambios de V8.2

- **Día y sesión por separado:** arriba eliges el día (Lunes a Domingo) y debajo la sesión (Lower A/B, Upper A/B, Full Body A/B, Cardio suave, Trote opcional, Descanso). Al cambiar el día se propone la sesión habitual de ese día. Las sesiones y ejercicios de cada semana no cambian.
- **Reloj flotante:** botón "⏱ Reloj" abajo a la derecha; al tocarlo abre un panel pequeño con temporizador o cronómetro y una ✕ para cerrarlo. Mientras corre, el botón muestra el tiempo.
- **Ejercicio agregado al inicio** (en Registrar y en Rutina Base).
- **Sistema / Objetivo / Debilidad clave** pasó al final de la página.
- **Actualizaciones sin mezclas:** al publicar una versión nueva, la app se recarga sola una vez. Antes podía cargar el diseño y el plan viejos junto con la página nueva.

## Cambios de V8.1

- **Temporizador y cronómetro** (en V8.2 pasó a ser el botón flotante "Reloj"): accesos rápidos de 1:00 a 4:00 y ajuste de ±15 s. Sigue contando aunque cambies de sección o recargues; al terminar vibra y suena.
- **Full Body A y B** (sesiones opcionales; en V8.1 se llamaban "Complemento - Full Body"): solo suman las series que faltan entre tu objetivo semanal y lo planificado, semana por semana. Prioridad: isquios, luego cuádriceps, glúteo, deltoide lateral, brazos y manguito. Sin cargar espalda ni cuello, sin nórdicos (isquio sensible) y con alternativa si el hombro molesta. La rutina, las series, las reps, el RIR y los objetivos existentes no cambian.
- Botón azul con mejor contraste. Revisión visual automática en celular, tablet y escritorio (sin textos invisibles, encimados ni desbordes).

Base de los full body:
- El volumen semanal es lo que más influye en el crecimiento; repartirlo en más días funciona igual ([Schoenfeld 2019](https://pubmed.ncbi.nlm.nih.gov/30558493/), [Pelland 2024](https://link.springer.com/article/10.1007/s40279-025-02344-w)).
- Curl femoral sentado > tumbado o nórdico para isquios ([Maeo 2021](https://doi.org/10.1249/MSS.0000000000002523)).
- Extensión de tríceps sobre la cabeza para la cabeza larga ([Maeo 2023](https://pubmed.ncbi.nlm.nih.gov/35819335/)).
- Elevación lateral con polea o mancuerna, mismo resultado ([estudio](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12277279/)).

## Cambios de V8.0

- **No se pierde lo que escribes en Registrar:** se guarda solo en el equipo mientras escribes y al cerrar o cambiar de app. Se mantiene aunque cambies de sección, edites la rutina, recargues o cierres la app, hasta presionar `Guardar sesión`. Registrar se ve igual que antes.
- **Funciona sin internet:** la app queda guardada en el dispositivo (service worker) y las librerías de Excel y gráficos vienen incluidas en `vendor/`.
- **Recordatorio de respaldo:** Inicio avisa si pasan más de 7 días sin descargar el respaldo JSON.
- **Peso como número + unidad:** "27,5 kg por mano" se guarda como 27,5 · kg · "por mano"; también acepta "80 lbs". Los datos antiguos se convierten solos.
- **1RM estimado, volumen y PRs automáticos:** al guardar una sesión avisa si hay récord nuevo; en Progreso hay un gráfico por ejercicio y la lista de récords.
- **Mismo ejercicio con otro nombre:** "Press inclinado manc." y "Press inclinado mancuernas" cuentan como el mismo (alias en `data/plan.json`).
- **Alertas de dolor:** si una zona o un ejercicio queda sobre 3/10 tres sesiones seguidas, aparece un aviso en Inicio y Progreso, junto al gráfico del semáforo por sesión.
- **Código ordenado:** `app.js` se dividió en módulos dentro de `js/`, el plan de entrenamiento pasó a `data/plan.json` y se limpió `styles.css` (sin cambios visuales).
- **Pruebas automáticas:** `npm test` y GitHub Actions (`.github/workflows/test.yml`).

## Estructura

- `index.html` · `styles.css` · `manifest.json` · `sw.js` (uso sin internet)
- `js/config.js` versión y claves · `js/util.js` utilidades · `js/domain.js` músculos, cargas, 1RM, PRs, alertas · `js/state.js` datos y migraciones · `js/training.js` Registrar · `js/views.js` pantallas · `js/io.js` importar/exportar · `js/app.js` arranque
- `data/plan.json` plan de 6 semanas, objetivos, sesiones reales y alias de ejercicios
- `vendor/` Chart.js 4.4.1 y SheetJS 0.18.5
- `tests/e2e.test.js` pruebas en Chromium

Al publicar una versión nueva, sube la versión en `js/config.js`, `sw.js` (`CACHE_VERSION`) y los `?v=` de `index.html` (la prueba lo verifica).

## Cambios de V7.5

- Botón `Respaldo` (barra superior y Ajustes): exporta un JSON con todos los datos. Se restaura con `Importar`.
- El Excel exportado usa las mismas hojas y columnas que la plantilla (`Registros`, `Rutina_Base`, `Objetivos_Semanales`, `Peso_Corporal`, `Cardio`) y se puede volver a importar sin duplicar sesiones.
- Opción `Todas las semanas` al exportar Excel.
- Plantilla sin filas de ejemplo (ya no pisa la rutina ni agrega una sesión falsa) y con la lista de músculos actual.
- Corrección de músculos mal clasificados (gemelos, circuito escapular, "ab" → core) y del % de ejecución semanal.
- Sin unidades duplicadas ("75 lbskg") y la referencia anterior muestra la mejor serie.
- Confirmación antes de borrar sesiones, cardio o peso, y antes de perder un registro sin guardar al cambiar semana/día.
- La migración desde versiones antiguas conserva rutinas editadas y agrega las semanas faltantes.
- Chart.js con versión fija, íconos para instalar como app y guardado protegido si el almacenamiento falla.

## Cambios de V7.4

- Pantalla previa de inicio con logo PR, usuario Martin Reyes y botón Iniciar.
- Menú móvil cerrado por defecto.
- Menú móvil como drawer lateral superpuesto.
- Contenido móvil usando todo el ancho disponible.
- Cache busting con `?v=7.4` para evitar que Safari/GitHub carguen CSS o JS antiguos.
- No se cambia rutina, semanas ni registros.

## Plan cargado

- Semana 1: Reentrada técnica / resensibilización.
- Semana 2: Acumulación efectiva.
- Semana 2.5 Pivot: registros reales cargados.
- Semana 3: Intensificación I.
- Semana 4: Intensificación II.
- Semana 5: Pico técnico controlado.
- Semana 6: Pivot / deload inteligente.

## Uso móvil

1. Abre el sitio.
2. Presiona `Iniciar`.
3. Usa el botón `☰` para abrir el menú.
4. Toca una sección.
5. El menú se cierra automáticamente y muestra el contenido.

## GitHub Pages

Sube todos los archivos a la raíz del repositorio y abre:

`https://mrg722.github.io/prime-os-M-Reyes-/`

## Guardado

Los datos se guardan en LocalStorage del navegador. Usa `Respaldo` cada cierto tiempo para descargar un JSON con todo; el Excel sirve para revisar y editar datos.

## Pendiente

El CSS usa fondos en `assets/backgrounds/bg_*.png` (inicio, rutina, entrenar, historial, progreso, cardio, nutricion, ajustes) que no están en el repositorio. Sin ellos se ven solo los degradados.
