# La presentación de SIPAU

Para la Exposición Final de Proyectos Modulares. Dura cerca de 9 minutos y la explican ustedes: avanza paso a paso con el teclado o con un señalador.

## Cómo abrirla

Haz doble clic en `index.html`. Se abre en Chrome o Edge y no necesita internet, ni que SIPAU esté corriendo. Pulsa `F` para verla en pantalla completa.

Si algo falla, abre `SIPAU-presentacion.pdf`: tiene las mismas 16 láminas, sin animación.

Antes de exponer, ábrela en la computadora y en el proyector que van a usar, y recórrela completa una vez.

## Teclas

| Tecla | Qué hace |
|---|---|
| `→` `↓` `Espacio` `AvPág` `Intro` | Siguiente paso. Un clic también avanza |
| `←` `↑` `RePág` `Retroceso` | Paso anterior, sin animación |
| Número + `Intro` | Salta a esa lámina. `12` y luego `Intro` va a la matriz |
| `Inicio` `Fin` | Primera y última lámina |
| `P` | Abre las notas, el reloj y lo que sigue en otra ventana |
| `N` | Muestra las notas sobre la lámina, para ensayar. El público también las ve |
| `F` | Pantalla completa |
| `B` | Apaga la pantalla, para conversar con el jurado. Otra vez `B` la regresa |
| `?` | Muestra estas teclas |

Un señalador normal funciona: envía `AvPág` y `RePág`. Su botón de presentación envía `F5`, y aquí pone pantalla completa en vez de recargar.

## La ventana del presentador

1. Conecta el proyector y pon la pantalla en modo **extendido**.
2. Abre `index.html` y pulsa `P`. Si el navegador bloquea la ventana, permítela.
3. Arrastra la presentación al proyector y pulsa `F`. Deja las notas en tu pantalla.

Las notas marcan el párrafo que toca decir, qué tan lejos van contra el plan y qué sigue. Sus botones también avanzan la presentación. El reloj arranca con el primer avance, y **Reiniciar reloj** lo regresa a cero.

Si exponen varias veces seguidas, pulsa `Inicio` para volver a la portada.

## Cómo cambiar algo

Todo el texto, las cifras y las notas están en `assets/js/datos.js`. Ábrelo con cualquier editor, cambia el texto entre comillas y recarga la página. Conserva las comillas y las comas.

Para cambiar quién expone una lámina, cambia su `orador`: `K`, `R`, `A` o `E`. Los nombres están al principio del archivo, en `oradores`, y salen en la barra de arriba.

El guion [GUION.md](GUION.md) repite las notas. Si cambias una nota, cámbiala también ahí.

## Cómo regenerar el PDF

1. Abre `index.html?imprimir` en Chrome: se ven todas las láminas, una debajo de otra.
2. Pulsa `Ctrl+P`, elige **Guardar como PDF** y deja los márgenes en **Ninguno**.
3. Activa **Gráficos de fondo** en *Más ajustes*.
4. Guárdalo como `SIPAU-presentacion.pdf`.

Debe tener 16 páginas.

## Qué es real y qué es ejemplo

Las cifras salen del entorno de prueba, con **datos sintéticos**, y son las mismas que comprueba `despliegue\3-verificar.bat`. Por eso el letrero *Datos sintéticos* se queda en la barra toda la presentación.

Dos cosas son ejemplos, y la lámina lo dice:

- **Láminas 2 y 3:** los tres números que no coinciden (552, 560 y 548) ilustran el problema. No son cifras de la universidad.
- **Lámina 7:** los valores que se capturan en la tabla.

El JSON de la lámina 7 es un fragmento acortado de `UPZMG.API/ReportTemplates/Escuela911_9_2024-2025.json`: el original tiene 7 renglones y 4 columnas.

Las láminas 8 y 9 usan capturas reales de la aplicación.

## Qué hay en la carpeta

| Archivo | Qué es |
|---|---|
| `index.html` | La presentación |
| `SIPAU-presentacion.pdf` | El plan B |
| `GUION.md` | Qué decir en cada lámina, tiempos y preguntas probables |
| `assets/js/datos.js` | Texto, cifras y notas |
| `assets/js/escenas.js` | El contenido y la animación de cada lámina |
| `assets/js/motor.js` | Pasos, teclado, ventana del presentador e impresión |
| `assets/js/iconos.js` | Los íconos Material que usa la aplicación |
| `assets/css/deck.css` | Los colores y componentes de SIPAU |
| `assets/fonts/` | Archivo y Archivo Narrow, con su licencia OFL |
| `assets/img/` | El logo de la UPZMG y las capturas de la aplicación |
