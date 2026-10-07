---
title: Taller 1 - Bloque 5 (Cierre y exposición)
tags:
  - taller
  - exposición
aliases:
  - Bloque 5 Taller UTEC
  - Guion de exposición Taller 1
---

# Taller 1 — Bloque 5: Cierre y exposición

> [!info] Contexto
> Parte de [[Taller 1 - Enunciado]]. Reúne lo de los bloques 1 a 4 en formato presentable.

> [!abstract] Qué pide el bloque
> Presentar el enunciado del caso de negocio, el alcance de la primera versión y el ERD. Explicar las principales decisiones de diseño y mostrar 1 o 2 consultas clave sobre el esquema propio.

## Estructura de la exposición

| Momento | Minutos | Qué se muestra en pantalla |
|---|---|---|
| 1. Caso y problema | 1:30 | Nada, o una lámina con la frase del problema |
| 2. Usuarios y alcance | 1:00 | La tabla de los tres roles |
| 3. ERD | 2:30 | El diagrama completo |
| 4. Decisiones de diseño | 2:30 | El ERD, señalando |
| 5. Dos consultas | 2:00 | El SQL y su resultado |
| **Total** | **~9:30** | |

> [!tip] Regla de oro
> **No leer el ERD tabla por tabla.** Recorrerlo por historias: "el proyecto en el centro, de acá cuelga el seguimiento del documento, de acá el de las reuniones". Enumerar ocho tablas con sus columnas quema tres minutos y no comunica nada.

---

## 1. Caso y problema — *1:30*

> [!quote] Guion
> "TesisTrack es una plataforma para el seguimiento de asesorías de tesis.
>
> El problema que resolvemos no es que falte información, sino que **está dispersa**: los acuerdos quedan en WhatsApp, las versiones del documento en el correo, las observaciones en un PDF comentado, y las fechas en la cabeza del asesor. Cuando alguien pregunta *«¿esa observación ya la corrigieron?»*, nadie puede responder sin revisar tres canales distintos.
>
> Nuestro sistema centraliza eso en un solo lugar, con un foco: **trazabilidad**. No es un gestor académico —no maneja matrícula, ni pagos, ni evalúa la calidad de la tesis—. Solo tiene que poder responder dos preguntas: al estudiante, *«¿en qué estado está mi tesis y qué me toca ahora?»*; al asesor, *«¿qué avanzó, qué le falta y qué observaciones siguen abiertas?»*."

## 2. Usuarios y alcance de la primera versión — *1:00*

> [!quote] Guion
> "Tres roles. El **estudiante** sube entregas y consulta sus observaciones y tareas. El **asesor** define los hitos, revisa entregas, deja observaciones y registra las reuniones. El **coordinador** solo consulta: no crea ni edita nada.
>
> El alcance de esta primera versión son ocho entidades. Deliberadamente **no** incluimos notificaciones, ni chat, ni almacenamiento del archivo dentro de la base —guardamos la ruta—, ni la institución como entidad, porque decidimos que la plataforma es general y no de una universidad puntual."

## 3. El ERD — *2:30*

Mostrar el diagrama y recorrerlo en este orden:

> [!quote] Guion
> "En el centro está **`proyecto`**, que es la tesis.
>
> A la izquierda, **`usuario`** conectado por **`participacion`**: es nuestra única relación **muchos a muchos**. Un asesor lleva varios proyectos y un proyecto tiene varios participantes —uno o dos estudiantes, un asesor, a veces un coasesor—. La resolvimos con esa tabla intermedia, que además guarda **el rol de esa persona en ese proyecto puntual**, que puede no ser el mismo que su rol global.
>
> Del proyecto bajan **dos cadenas paralelas**. La de la derecha es el seguimiento del documento: **`hito` → `entrega` → `observacion`**. Cada hito recibe varias entregas, una por versión; cada entrega puede recibir observaciones del asesor.
>
> La de abajo es el seguimiento de las reuniones: **`reunion` → `tarea`**. Lo que se conversa queda como texto en la reunión; lo que se convierte en compromiso con responsable y plazo pasa a ser una tarea.
>
> Y todas las tablas de actividad apuntan a **`usuario`**, porque en un sistema de trazabilidad siempre hay que saber **quién** hizo cada cosa.
>
> En total: 8 entidades, 8 llaves primarias, 14 foráneas, una relación N a M y doce 1 a N."

## 4. Decisiones de diseño — *2:30*

Cinco decisiones. Si el tiempo aprieta, las dos primeras son las imprescindibles.

### ★ 1. `observacion` tiene **dos** llaves foráneas a `entrega`

> [!quote] Guion
> "Esta es la decisión de la que estamos más conformes.
>
> La regla de negocio dice: una entrega recibe una observación, el estudiante corrige, y sube una versión nueva. En un modelo típico eso se resuelve con un campo `atendida` de sí/no. Nosotros vimos que eso **pierde información**: sabés que se resolvió, pero no *con qué versión*.
>
> Entonces `observacion` tiene dos FK a `entrega`: **`entrega_id`**, la que la originó, y **`resuelta_por_entrega_id`**, la que la corrigió. Con eso podemos reconstruir el proceso completo, que es literalmente para lo que existe el sistema."

### ★ 2. No almacenamos el estado `vencido`

> [!quote] Guion
> "Nuestra primera versión del modelo tenía un estado `vencido` para los hitos. Lo sacamos, porque es **información derivable**: un hito está atrasado si su fecha límite ya pasó y no está completado.
>
> Si lo guardáramos como estado, necesitaríamos un proceso que actualice las filas todas las noches, y entre corrida y corrida la tabla estaría mintiendo. Preferimos calcularlo en la consulta: siempre está bien."

### 3. Un solo `usuario` con un campo `rol`

Los tres roles comparten los mismos atributos y cada persona tiene uno solo. Un `CHECK` alcanza. Si mañana alguien necesitara ser asesor y coordinador a la vez, ahí sí habría que crear una tabla `rol` y una intermedia — sería una segunda relación N:M.

### 4. `CASCADE` para composición, `RESTRICT` para autoría

Dos reglas, no catorce decisiones sueltas. Si se borra un proyecto, sus hitos se van con él: son *parte del* proyecto. Pero un usuario **no se puede borrar** si tiene registros a su nombre: se marca inactivo. Un sistema de trazabilidad no puede perder al autor de una observación.

### 5. Ninguna relación 1 a 1 — y es a propósito

Evaluamos una: guardar en `hito` cuál es su entrega aprobada. La descartamos porque es derivable. Una relación 1:1 casi siempre es señal de que dos tablas deberían ser una sola; que no aparezca ninguna indica que el modelo está bien consolidado.

---

## 5. Las dos consultas clave — *2:00*

### Consulta 1 — La cadena de trazabilidad (`C1`)

Mostrar el SQL y el resultado.

> [!quote] Guion
> "Esta consulta une **`entrega` consigo misma dos veces**: una vez como la versión observada, otra como la versión que la corrigió. En una sola fila tenemos: qué versión se observó, qué dijo el asesor, qué versión lo corrigió y cuánto se tardó.
>
> El `LEFT JOIN` en la segunda es obligatorio, porque una observación que todavía está pendiente no tiene entrega correctora.
>
> Es la consulta que resume para qué existe todo el modelo."

### Consulta 2 — Proyectos sin asesor (`A3`)

> [!quote] Guion
> "Esta responde una pregunta real del coordinador: *¿qué tesis están arrancadas pero todavía sin asesor asignado?*
>
> Es un `LEFT JOIN` con `WHERE ... IS NULL`, que es la forma de encontrar registros **sin relación**. El detalle importante está en dónde van las condiciones: `rol_en_proyecto = 'asesor'` y `fecha_baja IS NULL` van en el **`ON`**, no en el `WHERE`. Si fueran al `WHERE`, filtrarían las filas nulas y el `LEFT JOIN` se comportaría como un `INNER JOIN` — perderíamos justo los proyectos que buscamos."

> [!note] Si sobra tiempo, la tercera opción es `B1`
> El panel de avance por proyecto, con `COUNT ... FILTER` y porcentaje. Sirve para mostrar agregación, pero es menos distintiva que las otras dos.

---

## Preguntas probables y cómo responderlas

| Pregunta | Respuesta corta |
|---|---|
| **¿Por qué el rol es un campo y no una tabla?** | Tres roles fijos y conocidos, y cada persona tiene uno solo. Un `CHECK` alcanza. Con roles múltiples haría falta una tabla `rol` y una intermedia |
| **¿Por qué no hay ninguna relación 1:1?** | Evaluamos una (hito ↔ entrega aprobada) y era derivable. Una 1:1 suele indicar dos tablas que deberían ser una |
| **¿Por qué `participacion` tiene `id` propio y no PK compuesta?** | Simplifica el mapeo con JPA y permite referenciar el registro si el modelo crece. La unicidad del par se garantiza igual con el `UNIQUE`. Ambas opciones son defendibles |
| **¿Qué pasa si se borra un usuario?** | La base lo impide: `ON DELETE RESTRICT`. Se marca `activo = FALSE`. Perder al autor de una observación destruiría la trazabilidad |
| **¿Cómo arman el historial si no hay tabla `historial`?** | Con un `UNION ALL` sobre reuniones, entregas y observaciones ordenado por fecha. Si el rendimiento lo pidiera, agregaríamos una tabla `evento` alimentada en cada registro |
| **¿Por qué los acuerdos no son una entidad?** | Un acuerdo sin responsable ni plazo es texto descriptivo, y va como campo de `reunion`. Cuando adquiere responsable y fecha se vuelve `tarea`, que sí tiene estado y ciclo de vida propio |
| **¿Por qué `VARCHAR` + `CHECK` y no `ENUM`?** | Agregar un valor a un `ENUM` requiere `ALTER TYPE` y quitarlo es casi imposible. Nuestros estados ya cambiaron una vez durante el diseño |
| **¿Cómo evitan dos asesores en un mismo proyecto?** | Con un **índice único parcial**: único sobre `proyecto_id`, pero solo donde el rol es asesor y no hay fecha de baja. Un `UNIQUE` normal no sirve: evita repetir personas, no roles |
| **¿Cómo se calcula el número de versión?** | Lo calcula el backend con `MAX(version) + 1`. El `UNIQUE (hito_id, version)` es lo que hace segura la operación si dos subidas ocurren a la vez: la segunda falla y se reintenta |
| **¿Qué mejorarían en una versión 2?** | Cerrar en la base la coherencia entre el rol global y el rol en el proyecto, con una FK compuesta. Hoy lo valida el backend y está documentado como limitación conocida |

---

## Errores a evitar en la exposición

| No hacer | Hacer |
|---|---|
| Leer el ERD tabla por tabla | Recorrerlo por las dos cadenas, desde `proyecto` |
| Decir "creemos que está bien" | Cada decisión tiene un **porqué** — usarlo |
| Mostrar el `CREATE TABLE` completo | Mostrar solo las dos consultas clave, con su resultado |
| Ocultar las limitaciones | Nombrar la del rol global: admitir un límite conocido suma, no resta |
| Improvisar el cierre | Terminar con la consulta de trazabilidad: es el punto más fuerte |

---

## Checklist de entregables

| Entregable | Archivo |
|---|---|
| Diagrama ERD | `erd_lucidchart.csv` → importado en Lucidchart |
| Enunciado del caso, usuarios, problema y alcance | [[Taller 1 - Bloque 1 (Diseño)]] §1 y §2 |
| Script de creación del esquema | `02_esquema.sql` |
| Script de carga de datos de prueba | `03_datos.sql` §1-8 |
| Script de `UPDATE` y `DELETE` | `03_datos.sql` §9-10 |
| 2-3 consultas de negocio | `04_consultas.sql` §A |

> [!success] Verificado el 2026-08-20 contra PostgreSQL 16.14
> Los tres scripts corrieron seguidos con `ON_ERROR_STOP=1` **sin un solo error**. Los conteos de carga dieron exactos, las 13 consultas devolvieron filas coherentes, y las 10 violaciones intencionales fallaron con el error documentado. Detalle en [[Taller 1 - Bloque 3 (Carga y manipulación)#7. Control final]].
>
> Si en la exposición preguntan *"¿lo probaron?"*, la respuesta es sí, y se puede nombrar el motor y la versión.

## Ver también
- [[Taller 1 - Enunciado]]
- [[Taller 1 - Bloque 1 (Diseño)]] — el ERD a proyectar
- [[Taller 1 - Bloque 4 (Consultas)]] — las consultas a mostrar
