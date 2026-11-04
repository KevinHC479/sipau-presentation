# Guion de la presentación

Para el equipo. Son las mismas notas que salen en la ventana del presentador (tecla `P`). Si cambian algo, cámbienlo en `assets/js/datos.js`: de ahí salen las notas de la pantalla.

Duración prevista: **8:55**. Cada párrafo es lo que se dice después de pulsar la tecla una vez. Kevin abre, Rafael sigue con reportes y lo distribuido, André explica el modelo, y cierran entre todos.

| # | Lámina | Quién | Tiempo | Se puede saltar |
|---:|---|---|---:|---|
| 1 | Portada | Kevin | 15 s |  |
| 2 | La misma pregunta, tres respuestas | Kevin | 30 s |  |
| 3 | Una sola base, una sola respuesta | Kevin | 30 s |  |
| 4 | Tablero de Control | Kevin | 30 s | Sí |
| 5 | Importación masiva | Kevin | 30 s | Sí |
| 6 | Sólo la API llega a la base | Kevin | 40 s |  |
| 7 | Un formato es un archivo, no un programa | Rafael | 45 s |  |
| 8 | El informe se arma con lo enviado | Rafael | 30 s | Sí |
| 9 | Si la API cae, la sesión sigue | Rafael | 30 s |  |
| 10 | 12 capturas, una sola matrícula | Rafael | 20 s | Sí |
| 11 | Un árbol que explica cada alerta | André | 50 s |  |
| 12 | Qué tan bien acierta | André | 60 s |  |
| 13 | Matrícula: tendencia, no pronóstico puntual | André | 40 s |  |
| 14 | Lo esperado y lo obtenido | Equipo | 45 s |  |
| 15 | Conclusiones y trabajo a futuro | Equipo | 30 s |  |
| 16 | Cierre | Equipo | 10 s |  |

## Si les dan menos tiempo

Escribe el número de la lámina y pulsa `Intro` para saltar.

- **Unos 7 minutos:** salten el Tablero (4), la Importación (5), el Informe (8) y los choques (10).
- **Unos 5 minutos:** lo mismo, y en el árbol (11) y la matriz (12) digan sólo el primer párrafo y las cifras de la matriz.

No salten nunca la matriz (12) ni *Lo esperado y lo obtenido* (14): ahí se ve que conocen los límites de sus cifras.

## Lámina por lámina

### 1. Portada

*Kevin · 15 s*

Buenos días. Somos Rafael, Kevin y André, y este es SIPAU: un sistema web hecho para la Universidad Politécnica de la Zona Metropolitana de Guadalajara. Su idea cabe en una frase: la misma cifra se captura una vez y se reporta muchas.


### 2. La misma pregunta, tres respuestas

*Kevin · 30 s*

La información vive en los archivos de cada área. Cada vez que vence un reporte, Planeación recolecta las mismas cifras, las concilia a mano y las pasa al formato oficial.

Y pasa esto: una misma pregunta, tres respuestas. Estos tres números son un ejemplo para ilustrar, no son cifras de la universidad. No hay datos en tiempo real, y la respuesta depende de a quién le preguntes y cuándo.


### 3. Una sola base, una sola respuesta

*Kevin · 30 s*

Nuestra hipótesis: si todas las áreas capturan en una base única con validación, y los formatos oficiales se describen como datos, las tres respuestas se vuelven una.

De ahí esperamos tres cosas: cada cifra se captura una sola vez, los formatos y el informe se integran sin recaptura, y la trayectoria académica permite señalar a qué alumnos atender primero. Al final les decimos qué se cumplió y qué no.


### 4. Tablero de Control

*Kevin · 30 s*

Esto ya es SIPAU. Nadie escribe estos números: se cuentan de lo que capturan las áreas. 552 alumnos activos de 1,077 registrados, 66 de nuevo ingreso y 231 grupos. Todo con datos sintéticos, generados por un script que imita la estructura de la universidad. Por eso ese letrero se queda arriba toda la presentación.

> **Ojo.** Si preguntan por la caída de 2024 Ene-Abr: está en los datos sintéticos y el sistema la detecta. La retomamos en la lámina de matrícula.

### 5. Importación masiva

*Kevin · 30 s*

Las áreas ya tienen sus padrones en Excel, así que se pueden cargar de golpe. Este archivo de prueba trae errores a propósito. Primero se revisa completo y no se guarda nada: dice qué fila falla y por qué, en palabras que entiende quien lo capturó.

Al confirmar, lo aceptado se guarda en una sola transacción: todo o nada. Revisar 500 filas toma 0.21 segundos, y guardarlas, unos 5.

> **Ojo.** Si preguntan: la importación cubre alumnos y personal. La de grupos es trabajo a futuro. Guardar 500 filas tomó entre 4.6 y 6.5 s en tres corridas; en una laptop cargada puede llegar a 10.

### 6. Sólo la API llega a la base

*Kevin · 40 s*

Primer módulo: arquitectura y programación. Son dos procesos independientes. El navegador habla con la Web con una cookie; la Web habla con la API con un token JWT; y sólo la API llega a la base.

La Web no tiene credenciales de la base de datos. Aunque quisiera, no podría consultarla directamente.

La API revisa el permiso en la base en cada petición, así que retirar un permiso o suspender una cuenta tiene efecto en la siguiente llamada. En total: 89 operaciones REST, 34 tablas y 36 llaves foráneas.

> **Ojo.** No digan «microservicios»: son dos procesos independientes que se hablan por HTTP.

### 7. Un formato es un archivo, no un programa

*Rafael · 45 s*

Los formatos oficiales cambian cada ciclo, así que no los programamos. Cada formato es un archivo como éste, y un motor propio lo convierte en pantalla: renglones, columnas y totales salen del archivo.

Al capturar, los totales se calculan solos y el envío se detiene hasta que todo cuadra. Fíjense que «Con discapacidad» no entra en el total: esas personas ya están contadas entre hombres y mujeres, y esa regla también viene en el archivo. Los valores de esta tabla son un ejemplo.

Son 8 formatos, 175 reactivos y 52 secciones. Publicar un ciclo nuevo es ajustar un archivo: es tarea administrativa, no de programación.

> **Ojo.** Sean precisos: del formato al informe no se recaptura, pero el formato todavía se llena a mano. Precargarlo es trabajo a futuro.

### 8. El informe se arma con lo enviado

*Rafael · 30 s*

El informe a la Junta Directiva no se recaptura. Toma sus cifras de los formatos que las áreas ya enviaron. En este ciclo van 6 de 8.

Y cada bloque dice de dónde salió: qué formato, cuándo se envió y quién lo envió. Esa línea es una captura real de la pantalla.

Lo que falta se marca como pendiente, sin cifras inventadas. Aquí, el capítulo de Infraestructura.

> **Ojo.** El informe se cierra y queda congelado. Entregarlo a la Junta es un paso aparte.

### 9. Si la API cae, la sesión sigue

*Rafael · 30 s*

Módulo de sistemas distribuidos. Como son procesos separados, uno puede caer sin tumbar al otro. Ésta es la pantalla real con todo en marcha.

Detenemos la API. La Web sigue viva: avisa con claridad y la sesión sigue abierta. También conserva lo que estabas capturando.

La API regresa, se pulsa Reintentar y seguimos en la misma sesión, sin volver a entrar.

> **Ojo.** Digan que corre en dos equipos sólo si ya lo probaron en dos equipos. Los scripts se probaron por IP de red en una sola máquina.

### 10. 12 capturas, una sola matrícula

*Rafael · 20 s*

Ahora, un choque: 12 capturas simultáneas de la misma matrícula. Una se guarda, y las otras 11 reciben un 409. Sin duplicados.

Cada choque tiene su herramienta: el índice único, rowversion para detectar que editaste sobre una lectura vieja, y sp_getapplock para las reglas que revisan varias filas. Seis pruebas levantan procesos reales para comprobarlo.


### 11. Un árbol que explica cada alerta

*André · 50 s*

Módulo de sistemas inteligentes. Éste es el árbol real que corre en el sistema, entrenado con 338 trayectorias que ya terminaron. Elegimos un árbol de decisión porque se puede leer: cada alerta es una regla que cualquiera puede revisar.

Sigamos a un alumno de prueba con promedio de 6.31. Baja por el árbol y llega a una hoja donde, de 11 alumnos con un último periodo parecido, 8 se dieron de baja. No decimos que se va a ir. Decimos a quién conviene entrevistar primero. Y damos un intervalo, porque 11 casos son pocos.

Son cinco variables, y el promedio pesa 83 %. El sexo se excluyó por equidad. Y tiene cinco protecciones contra fugas de información: tres veces apareció un modelo espectacular, y las tres había aprendido a leer la respuesta.

> **Ojo.** Etiqueta cuidadosa: predice la baja definitiva contra el egreso. Los alumnos activos nunca entrenan al modelo.

### 12. Qué tan bien acierta

*André · 60 s*

Cada cuadro es una de las 338 trayectorias terminadas.

47 acabaron en baja definitiva. Los otros 291 egresaron.

Y aquí está cómo les fue. De las 47 bajas detecta 16: una de cada tres. Se le escapan 31. Y da 28 alertas de más.

De cada 100 alumnos que marca, 36 fueron baja. Al azar serían 14: de ahí el lift de 2.6. La exactitud es 83 %, menos que el 86 % de decir siempre «egresa», que detecta cero: por eso no es la medida que usamos. El umbral de 35 % se eligió por costo: una baja no detectada vale tres alertas de más. Son métricas modestas, y las reportamos así porque les quitamos las trampas.

> **Ojo.** No digan «tiene 83 % de exactitud» como logro. Digan: detecta una de cada tres bajas y concentra 2.6 veces más bajas que el azar. Son datos sintéticos: con datos reales hay que volver a medir.

### 13. Matrícula: tendencia, no pronóstico puntual

*André · 40 s*

Ésta es la matrícula por periodo. El sistema marca sola esa caída de 2024 Ene-Abr: bajó 6.7 %, con una puntuación z de −2.8.

Una regresión lineal dice que crece cerca de 6.3 alumnos por periodo, y proyecta 584, más menos 45, para el siguiente periodo.

La pusimos a prueba contra dos referencias simples, y perdió: erró 20.4 alumnos en promedio, contra 13.8 y 9.9. Lo decimos en la pantalla del sistema. Sirve para leer la tendencia, no como pronóstico puntual. Los 5 periodos de prueba sí cayeron dentro del intervalo.


### 14. Lo esperado y lo obtenido

*Equipo · 45 s*

Respaldamos esto con 398 pruebas automáticas, 37 de ellas contra SQL Server real y 6 entre procesos, y compilando sin advertencias.

Volvamos a la hipótesis. Cada cifra se captura una vez: cumplido, una prueba compara el informe con el formato celda por celda. Formatos e informe sin recaptura: cumplido. Señalar con reglas explicables: parcial, porque prioriza entrevistas, no diagnostica. Y la mejora frente al proceso manual está pendiente: todavía no se mide con Planeación.

> **Ojo.** El póster dice 251 pruebas. Si no cambian la lona: «ésa fue la medición al imprimir; después de las auditorías son 398».

### 15. Conclusiones y trabajo a futuro

*Equipo · 30 s*

Centralizar la captura y describir los formatos como datos resolvió el problema de fondo en el entorno de prueba. El modelo aportó valor sólo cuando le quitamos las fugas, y una universidad pequeña puede sustituir su consolidación manual con un sistema propio.

Lo que sigue: cargar la historia académica real y volver a medir, medir el proceso manual con Planeación, desplegar en infraestructura institucional con convenio de datos personales, y extender la importación y la precarga.


### 16. Cierre

*Equipo · 10 s*

Gracias. ¿Tienen preguntas? Si quieren, lo vemos funcionando en vivo.


## Preguntas que probablemente les hagan

**¿Son datos reales?**
No. Son sintéticos: los generó un script que imita la estructura de la universidad. Sirvieron para comprobar el sistema de punta a punta. Las métricas del modelo hay que volver a medirlas con la historia académica real.

**¿Por qué un árbol y no una red neuronal?**
Porque se puede leer. Planeación necesita saber por qué se señala a un alumno, y un árbol lo dice con una regla. También hay pocos casos: 338 trayectorias y 47 bajas.

**¿Cómo decide el árbol dónde cortar?**
Con el índice de Gini: G = 1 − Σ pᵢ². En cada nodo prueba los cortes posibles y se queda con el que deja los grupos más puros. Profundidad máxima de 4 y al menos 10 casos por hoja.

**¿Por qué el umbral es 35 % y no 50 %?**
Se calcula en cada entrenamiento: entre 5 % y 95 %, gana el de menor costo, donde una baja no detectada vale tres alertas de más. Da 35 %, con un costo de 121 (28 alertas de más + 3 × 31 bajas no detectadas). Con costos de 2 a 4 sale el mismo umbral.

**¿Qué significa el lift de 2.6?**
De cada 100 alumnos que marca, 36 fueron baja. Al azar serían 14. 36 entre 14 da 2.6.

**Si la exactitud es 83 %, ¿por qué dicen que no sirve?**
Porque 86 % de los alumnos egresa. Decir siempre «egresa» acierta más y no detecta a nadie. Por eso se mide con sensibilidad, precisión y lift.

**¿Qué es una fuga de información?**
Darle al modelo, sin querer, una pista de la respuesta. Al darse de baja, las materias abandonadas quedan reprobadas: si se usa ese periodo, «reprobar predice la baja», pero es al revés. Las cinco protecciones son: no entrenar con activos, no contar la baja temporal, descartar el periodo del desenlace, usar la edad al ingreso y medir a todos con la misma ventana.

**¿La proyección de matrícula sirve?**
Para leer la tendencia, sí. Como número exacto, no: erró 20.4 alumnos en promedio, más que repetir el último valor (13.8) o sumarle el crecimiento medio (9.9). Los 5 periodos de prueba cayeron dentro del intervalo.

**¿Esto es un sistema distribuido o sólo un cliente y un servidor?**
Son dos procesos que hicimos nosotros y que sólo se hablan por HTTP, con JWT, con tolerancia a la caída de la API y control de concurrencia en tres niveles. Para decir que corre en dos equipos, ensáyenlo antes con `despliegue/dos-equipos/LEEME.md`: los scripts se probaron por IP de red en una sola máquina, no en dos laptops.

**¿Los formatos se llenan solos?**
No. Se capturan una vez, en línea y con validación, y el informe los consolida sin recaptura. Precargar el formato con lo que el sistema ya calcula es trabajo a futuro.

**¿Qué se puede importar?**
Alumnos y personal, por CSV. Reconoce lo que guarda Excel en México. La importación de grupos está pendiente.

**¿Por qué no suman los promedios en los formatos?**
Porque no se pueden sumar: un promedio de promedios o una suma de porcentajes da un dato falso. Las plantillas sólo suman lo que se puede sumar.

**El póster dice 251 pruebas y aquí 398.**
Ésa fue la medición al imprimir. Después de las auditorías, son 398: 355 unitarias, 37 de integración y 6 distribuidas.

**¿Mejora frente al proceso manual?**
No lo hemos medido. Está en pendientes, y se medirá con Planeación en la implantación.

## Frases que conviene cuidar

| No digan | Mejor digan |
|---|---|
| Predice quién va a abandonar | Señala a quién conviene entrevistar primero |
| Tiene 83 % de exactitud | Detecta una de cada tres bajas y concentra 2.6 veces más bajas que el azar |
| Reduce la deserción | No lo hemos medido |
| Los formatos se llenan solos | Se llenan una vez, y el informe los consolida solo |
| Ya está en producción | Funciona en un entorno de prueba, con datos sintéticos |
| Son microservicios | Son dos procesos independientes que se hablan por HTTP |
