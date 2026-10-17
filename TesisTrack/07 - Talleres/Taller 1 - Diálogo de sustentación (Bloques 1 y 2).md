---
title: Taller 1 - Diálogo de sustentación (Bloques 1 y 2)
tags:
  - taller
  - curso
  - diseño
aliases:
  - Diálogo de sustentación Taller 1
  - Guion de defensa Taller 1
---

# Diálogo de sustentación — TesisTrack (Taller 1, Bloques 1 y 2)

> [!info] Qué es esta nota
> Guion en formato pregunta-respuesta para sustentar el proyecto ante la profesora, cubriendo los tres entregables pedidos: **(1)** el diagrama ERD, **(2)** el enunciado del caso de negocio con usuarios y alcance, y **(3)** el script SQL con los `CREATE TABLE`. Se puede leer tal cual o usar como base y decirlo con las propias palabras — lo importante es no dejar afuera ningún punto que se vaya a evaluar.
>
> Complementa a [[Taller 1 - Exposición (ERD, caso y esquema)]] (los tres entregables en limpio, sin diálogo) y a [[Taller 1 - Base de datos desde cero]] (la nota completa, con los Bloques 3 y 4).

## Apertura

**Profesora:** Cuéntame de qué trata tu proyecto y qué me vas a entregar hoy.

**Estudiante:** Claro. Mi proyecto se llama TesisTrack y hoy le voy a mostrar los tres entregables del Taller 1: el diagrama entidad-relación, el enunciado del caso de negocio con los usuarios y el alcance, y el script SQL que crea el esquema completo en PostgreSQL. Se lo explico en ese orden: primero el diseño, y después cómo ese diseño se convirtió en código.

## 1. Caso de negocio, usuarios y alcance (primer entregable)

**Profesora:** Empecemos por el caso de negocio. ¿Qué problema resuelve tu sistema?

**Estudiante:** Durante una tesis, el estudiante y su asesor generan muchísima información: acuerdos de reuniones, tareas pendientes, fechas de entrega, versiones de documentos, observaciones sobre esos documentos. Hoy todo eso vive repartido entre WhatsApp, correo y notas sueltas de reuniones, y se pierde o se desordena fácilmente. TesisTrack centraliza toda esa información en un solo lugar, con trazabilidad: quién dijo qué, quién subió qué versión, quién dejó qué observación y cuándo.

**Profesora:** ¿Y quiénes usan el sistema?

**Estudiante:** Hay tres roles. El estudiante consulta su proyecto y sus hitos, sube entregas, ve las observaciones que le dejan y las tareas que tiene pendientes, y revisa el historial de reuniones. El asesor gestiona los hitos del proyecto, revisa las entregas, deja observaciones, y registra tanto las reuniones como las tareas que salen de ellas. El coordinador solo tiene lectura: puede consultar cualquier proyecto de la institución, pero no crea ni edita nada — su rol es de supervisión.

**Profesora:** ¿Cuál es el alcance de esta primera versión?

**Estudiante:** El alcance son las funcionalidades mínimas para que un proyecto de tesis se pueda seguir de principio a fin dentro del sistema: crear el proyecto y asignarle participantes, definir hitos con fecha límite, registrar reuniones y las tareas que de ahí se desprenden, subir entregas versionadas contra cada hito, y que el asesor pueda dejar observaciones sobre esas entregas. Todo lo que sea reportes avanzados, notificaciones automáticas o integraciones externas queda fuera de esta primera versión; es una base sobre la que se puede seguir construyendo.

## 2. Entidades, atributos y relaciones (base del ERD)

**Profesora:** Antes de ver el diagrama, dime qué entidades identificaste.

**Estudiante:** Son ocho tablas, todas en `snake_case` y en singular:

- **`usuario`** — cualquier persona que entra al sistema, con su rol (estudiante, asesor o coordinador).
- **`proyecto`** — la tesis en sí, el contenedor principal, con su estado (en curso, pausado, finalizado, cancelado).
- **`proyecto_participante`** — la tabla intermedia que conecta usuarios con proyectos.
- **`hito`** — los puntos de control planificados dentro de un proyecto: plan de tesis, marco teórico, borrador final, etc.
- **`reunion`** — cada asesoría registrada, con su fecha, tema, resumen y acuerdos en texto libre.
- **`tarea`** — los compromisos concretos que salen de una reunión, con responsable y plazo.
- **`entrega`** — cada versión de un documento que el estudiante sube contra un hito.
- **`observacion`** — los comentarios que el asesor deja sobre una entrega específica.

**Profesora:** ¿Por qué necesitas una tabla intermedia? ¿Dónde está tu relación N:M?

**Estudiante:** Es la relación entre `usuario` y `proyecto`, y es la única N:M de todo el modelo. Un asesor puede guiar varios proyectos a la vez, y un proyecto puede tener varios participantes: uno o dos estudiantes, un asesor y, eventualmente, un coasesor. Como una tabla relacional no puede representar una relación muchos-a-muchos directamente, la resuelvo con `proyecto_participante`, que la descompone en dos relaciones uno-a-muchos: un proyecto tiene muchas filas en `proyecto_participante`, y un usuario también tiene muchas filas ahí. El campo `rol_en_proyecto` es el que distingue si esa fila representa a un estudiante, un asesor o un coasesor dentro de ese proyecto puntual — es distinto del rol general del usuario en la tabla `usuario`, porque una misma persona podría en teoría ser asesor en un proyecto y, en otro contexto, tener otro rol.

**Profesora:** ¿Y las demás relaciones?

**Estudiante:** Las demás son todas uno-a-muchos, once en total. Cinco son de "pertenencia": un proyecto tiene muchos hitos, un proyecto tiene muchas reuniones, un hito tiene muchas entregas (sus versiones), una entrega tiene muchas observaciones, y una reunión tiene muchas tareas. Las otras seis son de "autoría", y todas nacen desde `usuario`: quién registra una reunión, quién sube una entrega, quién deja una observación, quién es responsable de una tarea, y las dos relaciones de `proyecto_participante` hacia `usuario` y hacia `proyecto` que ya mencioné. No hay ninguna relación uno-a-uno en el modelo; no encontré ningún caso en el negocio donde tuviera sentido dividir una entidad en dos tablas con cardinalidad 1:1.

## 3. El diagrama ERD (primer entregable, en detalle)

**Profesora:** Muéstrame el diagrama. ¿Cómo identifico las llaves ahí?

**Estudiante:** *(comparto el ERD)* Cada tabla aparece como un rectángulo con sus atributos, y marco con **PK** la llave primaria y con **FK** las llaves foráneas, además de anotar a qué tabla apunta cada una. Las líneas entre tablas usan notación de "pata de gallo": el símbolo de "uno" (la barra doble) va del lado del padre, y el símbolo de "muchos" (el círculo con las tres líneas) va del lado del hijo. Por ejemplo, la línea entre `proyecto` y `hito` tiene la barra del lado de `proyecto` y la pata de gallo del lado de `hito`, porque un proyecto tiene muchos hitos pero cada hito pertenece a un solo proyecto.

**Profesora:** ¿Cómo se ve la N:M en el diagrama?

**Estudiante:** No aparece como una línea directa entre `usuario` y `proyecto`; aparece como dos relaciones 1:N independientes, cada una llegando a `proyecto_participante`. Esa es la evidencia visual de que la N:M ya está resuelta: si alguien mira el diagrama y ve una tabla en el medio con dos flechas de "muchos-a-uno" saliendo hacia las dos tablas originales, sabe que ahí hay una N:M resuelta correctamente.

**Profesora:** Resúmeme el cuadro de llaves.

**Estudiante:** Con gusto:

| Tabla | PK | FK | Restricciones únicas adicionales |
|---|---|---|---|
| `usuario` | `id` | — | `email` |
| `proyecto` | `id` | — | — |
| `proyecto_participante` | `id` | `proyecto_id`, `usuario_id` | `(proyecto_id, usuario_id)` |
| `hito` | `id` | `proyecto_id` | `(proyecto_id, orden)` |
| `reunion` | `id` | `proyecto_id`, `registrado_por` | — |
| `tarea` | `id` | `reunion_id`, `responsable_id` | — |
| `entrega` | `id` | `hito_id`, `subido_por` | `(hito_id, version)` |
| `observacion` | `id` | `entrega_id`, `asesor_id` | — |

Totales: 8 tablas, 8 PK, 11 FK, 4 restricciones únicas. Todas las PK son `id` de tipo `BIGSERIAL`, autoincremental, y son llaves sustitutas (*surrogate keys*) — no uso llaves naturales porque cosas como el email podrían, en teoría, cambiar de significado o duplicarse en escenarios raros, y prefiero desacoplar la identidad interna de un dato de negocio.

## 4. Del ERD al script SQL (segundo entregable de esquema)

**Profesora:** Pasemos al script. ¿Cómo tradujiste el diagrama a `CREATE TABLE`?

**Estudiante:** Cada rectángulo del ERD se convirtió en una sentencia `CREATE TABLE`, cada atributo en una columna con su tipo de dato, y cada línea de relación en una `FOREIGN KEY` con `REFERENCES`. El orden de las sentencias en el script respeta las dependencias: primero creo `usuario` y `proyecto`, que no dependen de nadie, y recién después las tablas que sí tienen llaves foráneas hacia ellas, porque PostgreSQL exige que la tabla referenciada ya exista.

**Profesora:** Explícame las decisiones de tipos de datos.

**Estudiante:** Uso `BIGSERIAL` para todas las PK, porque genera el autoincremental y da margen de crecimiento (a diferencia de `SERIAL`, que es de 32 bits). Para textos cortos y acotados uso `VARCHAR` con un largo pensado para el caso real: `VARCHAR(150)` para el nombre de un hito, `VARCHAR(255)` para el hash de la contraseña, `VARCHAR(20)` para los campos de estado y rol, que son códigos cortos. Para contenido largo y de longitud impredecible, como la descripción de un proyecto, el resumen de una reunión o el comentario de una observación, uso `TEXT`, que en PostgreSQL no tiene penalidad de rendimiento frente a `VARCHAR`. Para fechas sin hora, como `fecha_limite` o `fecha_inicio`, uso `DATE`; para fechas con hora, como `creado_en` o `fecha_entrega`, uso `TIMESTAMP`. Y `activo` en `usuario` es `BOOLEAN`, porque es estrictamente verdadero o falso.

**Profesora:** ¿Y las restricciones? Quiero que me expliques cada tipo con un ejemplo tuyo.

**Estudiante:** Con gusto, tengo los cinco tipos que pide la consigna:

- **PK** (`PRIMARY KEY`): el `id` de cada tabla, por ejemplo `id BIGSERIAL PRIMARY KEY` en `usuario`.
- **FK** (`REFERENCES`): por ejemplo `proyecto_id BIGINT NOT NULL REFERENCES proyecto(id)` en `hito`, que garantiza que un hito nunca apunte a un proyecto que no existe.
- **NOT NULL**: en todo campo obligatorio para que el registro tenga sentido, como `titulo` en `proyecto` o `descripcion` en `tarea` — no puede existir una tarea sin descripción.
- **UNIQUE**: el `email` en `usuario`, porque es la credencial de acceso y no puede repetirse. También tengo restricciones únicas compuestas: `UNIQUE (proyecto_id, usuario_id)` en `proyecto_participante`, para que una persona no quede registrada dos veces en el mismo proyecto; `UNIQUE (proyecto_id, orden)` en `hito`, para que no haya dos hitos con el mismo número de orden dentro de un proyecto; y `UNIQUE (hito_id, version)` en `entrega`, para que el número de versión sea correlativo y no se repita dentro de un mismo hito.
- **CHECK**: en todos los campos de estado y rol, que son un conjunto cerrado de valores. Por ejemplo, `rol` en `usuario` solo acepta `'ESTUDIANTE'`, `'ASESOR'` o `'COORDINADOR'`; `estado` en `entrega` solo acepta `'ENVIADA'`, `'EN_REVISION'`, `'OBSERVADA'` o `'APROBADA'`. Así evito valores inconsistentes sin necesidad de crear una tabla catálogo aparte para algo tan estable.
- **DEFAULT**: cumplo el pedido de al menos un valor automático con `creado_en TIMESTAMP NOT NULL DEFAULT now()` en `usuario` y `proyecto` — cada vez que se inserta un registro, PostgreSQL pone la fecha y hora actuales sin que la aplicación tenga que calcularlas. También uso `DEFAULT` en `estado` (por ejemplo `'EN_CURSO'` en `proyecto`, `'PENDIENTE'` en `hito` y `tarea`, `'ENVIADA'` en `entrega`) y en `fecha_inicio DATE DEFAULT CURRENT_DATE`, para que un registro nuevo arranque en un estado razonable si no se especifica otra cosa.

**Profesora:** Ahora justifícame las acciones referenciales. ¿Por qué elegiste `CASCADE` en unos casos y `RESTRICT` en otros?

**Estudiante:** Seguí un criterio consistente en todo el esquema, según el tipo de relación:

Cuando la fila hija no tiene sentido de existir sin su padre, uso `ON DELETE CASCADE`. Esa es toda la cadena documental del proyecto: si se borra un proyecto, se borran en cascada sus `hito`, `reunion` y `proyecto_participante`; si se borra un hito, se borran sus `entrega`; si se borra una entrega, se borran sus `observacion`; y si se borra una reunión, se borran sus `tarea`. Tiene sentido porque un hito huérfano sin proyecto, o una observación huérfana sin entrega, no significan nada por sí solos — son información dependiente, no independiente.

En cambio, cuando la llave foránea apunta a `usuario` para registrar quién hizo algo — es decir, autoría — uso `ON DELETE RESTRICT`. Eso es `registrado_por` en `reunion`, `responsable_id` en `tarea`, `subido_por` en `entrega`, `asesor_id` en `observacion`, y también `usuario_id` en `proyecto_participante`. La razón es que esas filas son historial: si alguien pudiera borrar a un usuario que ya dejó observaciones o subió entregas, perderíamos la trazabilidad de quién hizo qué, que es justamente el problema que TesisTrack busca resolver. Por eso, en vez de borrar usuarios, el modelo contempla el campo `activo` en `usuario` — para desactivarlos sin destruir su historial.

**Profesora:** ¿Y el `ON UPDATE`?

**Estudiante:** En todos los casos dejo `ON UPDATE NO ACTION`, que es el comportamiento por defecto en PostgreSQL. Como todas mis PK son `BIGSERIAL` autogenerados, nunca se actualizan manualmente una vez creados — no hay un escenario de negocio donde el `id` de un proyecto o de un usuario deba cambiar. Por eso no necesito propagar la actualización con `CASCADE`; simplemente no espero que ese valor cambie nunca.

**Profesora:** Para cerrar, ¿qué son esos `CREATE INDEX` al final del script? Eso no estaba explícitamente en la consigna.

**Estudiante:** Es un complemento al diseño, no un entregable en sí, pero lo incluyo porque va de la mano de las FK. Cada índice acelera una consulta que sé que el sistema va a hacer seguido: por ejemplo, `idx_hito_proyecto_fecha` sirve para listar los hitos de un proyecto ordenados por fecha límite; `idx_entrega_hito_version` para traer rápidamente la última versión de una entrega dentro de un hito; `idx_tarea_responsable` para que un estudiante vea sus tareas pendientes sin recorrer toda la tabla. El resto son índices sobre las columnas FK que no vienen indexadas automáticamente en PostgreSQL (a diferencia de la PK, que sí lo está), lo cual además ayuda a que los `ON DELETE CASCADE` y `RESTRICT` verifiquen la integridad más rápido.

## Cierre

**Profesora:** Muy bien. Resúmeme en una frase qué me estás entregando hoy.

**Estudiante:** Le entrego los tres productos del Taller 1: el enunciado del caso de negocio de TesisTrack con sus usuarios, el problema que resuelve y el alcance de esta primera versión; el diagrama ERD con las ocho entidades, sus atributos, y todas las PK y FK marcadas, incluida la N:M entre `usuario` y `proyecto` resuelta con `proyecto_participante`; y el script SQL que traduce ese diagrama en ocho `CREATE TABLE` con sus tipos de datos, restricciones (`PK`, `FK`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`) y acciones referenciales justificadas según si la relación es de pertenencia (`CASCADE`) o de autoría/historial (`RESTRICT`).

## Preguntas de repaso (por si la profesora repregunta)

**¿Por qué no hiciste tablas catálogo para `rol` o `estado` en vez de `CHECK`?**
Porque son conjuntos de valores pequeños, cerrados y muy estables — no espero agregar un cuarto rol de usuario la próxima semana. Una tabla catálogo aportaría flexibilidad que acá no necesito, a cambio de un `JOIN` adicional en cada consulta. Si el negocio creciera y los estados empezaran a tener atributos propios (por ejemplo, un color o una descripción larga por estado), ahí sí migraría a una tabla catálogo.

**¿Qué pasa si un hito necesita más de un asesor revisando?**
Con el modelo actual, cualquier participante con `rol_en_proyecto = 'ASESOR'` o `'COASESOR'` en `proyecto_participante` puede dejar observaciones sobre cualquier entrega del proyecto, porque `observacion.asesor_id` referencia directamente a `usuario`, no está atado a un asesor "principal" del hito. No hace falta cambiar el esquema para soportar coasesores revisando.

**¿Por qué `proyecto_participante` tiene su propio `id` en vez de usar `(proyecto_id, usuario_id)` como PK compuesta?**
Por consistencia con el resto del esquema, donde toda tabla tiene una PK sustituta de un solo campo — así cualquier tabla futura que necesite referenciar una fila de `proyecto_participante` (por ejemplo, si más adelante se quisiera loggear cambios de rol) lo hace con una sola columna. La integridad de "no duplicados" igual queda garantizada con el `UNIQUE (proyecto_id, usuario_id)`.

**¿Por qué no hay ninguna relación 1:1?**
Se evaluaron dos candidatas — `hito` con su entrega aprobada, y `usuario` separado en credenciales/perfil — y ambas se descartaron: la primera es derivable con una consulta, la segunda solo agregaría un `JOIN` sin necesidad real. Ver el detalle en [[Taller 1 - Base de datos desde cero#4. Relaciones 1:1, 1:N y N:M]].

> [!note] Si preguntan por las consultas o la carga de datos (Bloques 3 y 4)
> Ese contenido vive en [[Taller 1 - Base de datos desde cero]] — no repetido acá porque este diálogo cubre puntualmente los tres primeros entregables. Cuando el Bloque 4 esté armado, conviene agregar acá 1-2 preguntas de repaso sobre las consultas de negocio, tal como pide el Bloque 5 del enunciado ("mostrar 1 o 2 consultas clave").

## Antes de presentar — checklist

- [ ] Correr el script completo de `CREATE TABLE` contra una base PostgreSQL vacía y confirmar que las 8 tablas y los 9 índices se crean sin error
- [ ] Tener el ERD como imagen a mano (exportado desde [mermaid.live](https://mermaid.live)), por si la proyección no renderiza Mermaid en vivo
- [ ] Repasar las "Preguntas de repaso" de esta nota, no solo el guion principal
- [ ] Si preguntan por qué el modelo no coincide con una versión más grande del sistema, tener a mano la respuesta corta: *"esta es la primera versión, el alcance mínimo — se puede extender después sin romper lo que ya existe"*

## Ver también
- [[Taller 1 - Exposición (ERD, caso y esquema)]] — los tres entregables sin el formato de diálogo
- [[Taller 1 - Base de datos desde cero]] — nota completa, con `INSERT`/`UPDATE`/`DELETE` (Bloque 3) y consultas de negocio (Bloque 4, pendiente)
