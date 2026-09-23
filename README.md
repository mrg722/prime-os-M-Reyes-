# Prime OS - Martin Reyes V7.5

## Qué es

Prime OS es una plataforma personal de entrenamiento para registrar rutina, series, reps, RIR/RPE, descanso, dolor, fatiga, progreso semanal, cardio y peso corporal.

## Objetivo

Automatizar el seguimiento del bloque de entrenamiento de Martin Reyes para tomar mejores decisiones de carga, volumen, progreso y recuperación.

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
- Cache busting con `?v=7.4` (ahora `?v=7.5`) para evitar que Safari/GitHub carguen CSS o JS antiguos.
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
