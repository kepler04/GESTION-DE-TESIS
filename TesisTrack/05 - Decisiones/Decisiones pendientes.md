---
title: Decisiones pendientes
tags:
  - decisiones
---

# Decisiones pendientes

> [!warning] Antes de avanzar con el desarrollo
> Estas decisiones deben resolverse antes de programar funcionalidades que luego podrían eliminarse o modificarse por cambios de alcance.

> [!success] Todas cerradas el 2026-08-16
> **1, 3, 5 y 6** se cerraron para diseñar el modelo de datos del [[Entregables y evaluación|Entregable 1]] — eran las que afectaban al diagrama ER.
> **2, 4, 7 y 8** se cerraron a continuación para poder escribir la API del [[Entregables y evaluación|Entregable 2]], porque definen qué rol puede llamar a cada endpoint.
> De la **9** a la **16** surgieron durante el [[Entregables y evaluación|Entregable 3]]: al rediseñar el registro, al ordenar la carga de trabajo del asesor, al resolver cómo un asesor privado suma a sus asesorados, al repartir una consigna a todo un espacio, al abrir las asesorías como canal de consultas y al arreglar el primer minuto del asesor nuevo.
>
> Las decisiones nuevas se agregan con su fecha. La Fase 1.5 incorpora las decisiones 21 a 25; queda por confirmar si las asesorías privadas necesitan un código personal, sin implementarlo en esta fase.

## Decisión 1 - Universidad específica o plataforma general

¿TesisTrack será para una universidad específica o será una plataforma general?

**Estado:** ✅ cerrada (2026-08-16) — **plataforma general**

Se confirma la propuesta que ya estaba en evaluación: TesisTrack es una plataforma general de seguimiento de asesorías. Durante el desarrollo y la validación se usa un proceso universitario concreto como referencia, pero el sistema no depende del reglamento de una sola universidad.

**Consecuencia en el modelo de datos:** *no* se agrega una entidad `Institución`. Se descartó la variante multi-institución porque sumaba una tabla y una capa de permisos que el [[Alcance]] no pide, y el foco del proyecto es la trazabilidad de la asesoría, no la administración universitaria.

Ver [[Alcance#Universidad específica o plataforma general]].

## Decisión 2 - Quién crea los hitos

¿Quién puede crear los hitos?

**Estado:** ✅ cerrada (2026-08-16) — **el asesor del proyecto**

Solo el asesor asignado al proyecto crea sus hitos. El estudiante los consulta y entrega contra ellos, pero no los define.

Es lo que ya decía [[Usuarios y roles]]: el asesor "gestiona o revisa hitos", el estudiante solo "consulta los hitos". Se descartó que el estudiante los cree porque dejaría al asesor sin control sobre las etapas que después tiene que evaluar.

> [!note] Consecuencia
> Un proyecto sin asesor asignado no puede tener hitos todavía. Es aceptable: el estudiante crea el proyecto y elige asesor en el mismo flujo (ver [[Flujo del sistema#Creación de un proyecto]]).

## Decisión 3 - Estados del hito

¿Qué estados tendrá un hito?

**Estado:** ✅ cerrada (2026-08-16) — **los 5 estados propuestos**

`PENDIENTE` → `EN_PROCESO` → `ENTREGADO` → `OBSERVADO` → `COMPLETADO`, con retorno de `OBSERVADO` a `ENTREGADO` cuando el estudiante sube una corrección.

Se eligió sobre las variantes de 3 y 4 estados porque `OBSERVADO` es el estado que sostiene el ciclo de corrección descrito en [[Reglas de negocio]] — sin él no se distingue "entregado, esperando revisión" de "revisado, hay que corregir", que es justo la pregunta que el [[Alcance]] dice que el sistema debe responder.

Ver [[Hitos#Estados del hito]].

## Decisión 4 - Modificación de hitos

¿Los hitos pueden modificarse después de crear el proyecto?

**Estado:** ✅ cerrada (2026-08-16) — **sí, con un límite al borrar**

- **Editar** (nombre, descripción, fecha límite, orden): siempre, por el asesor del proyecto.
- **Borrar**: solo si el hito **no tiene entregas**. Si ya las tiene, la API responde 400.

El límite protege la trazabilidad de [[Reglas de negocio#Historial]] sin necesitar una tabla de auditoría. Se descartó "inmutables" porque contradice [[Hitos]], que insiste en que los hitos sean configurables y flexibles.

## Decisión 5 - Relación hito-entrega

¿Cómo se relacionará un hito con las entregas?

**Estado:** ✅ cerrada (2026-08-16) — **un hito tiene N entregas**

Cada entrega pertenece a exactamente un hito, y el hito acumula sus versiones como entregas sucesivas (v1, v2, v3...). El número de versión vive en la propia entrega.

Coincide con el ER preliminar y con el ejemplo de flujo de [[Reglas de negocio#Ejemplo de flujo completo]] (`Marco teorico_v2.pdf` → observación → `Marco teorico_v3.pdf`). Se descartó la variante N↔N porque una entrega que cubre varios hitos vuelve ambiguo el estado del hito, y la variante 1↔1 con tabla de versiones aparte porque agrega una tabla sin ganar nada: la entrega *es* la versión.

## Decisión 6 - Observaciones y versiones

¿Cómo se relacionarán las observaciones con las diferentes versiones de una entrega?

**Estado:** ✅ cerrada (2026-08-16) — **la observación cuelga de la entrega concreta**

Cada observación apunta a la entrega (es decir, a la versión) que la originó. Así se puede reconstruir "esto se observó en la v2 y se corrigió en la v3", que es exactamente la trazabilidad que pide [[Reglas de negocio#Historial]].

Se descartó colgarlas del hito porque se perdería qué versión originó cada observación.

## Decisión 7 - Permisos por rol

¿Qué permisos tendrá cada rol?

**Estado:** ✅ cerrada (2026-08-16) — matriz completa en [[Usuarios y roles#Matriz de permisos]]

Regla base: **el acceso se resuelve por pertenencia al proyecto, no solo por rol.** Un asesor no puede tocar un proyecto que no es suyo aunque tenga rol `ASESOR`. La única excepción es el coordinador, que lee todo (ver Decisión 8).

## Decisión 8 - Alcance del coordinador

¿Cuál será exactamente el alcance del coordinador?

**Estado:** ✅ cerrada (2026-08-16) — **solo lectura, global**

El coordinador puede consultar todos los proyectos, hitos, entregas, asesorías y tareas de la plataforma, pero **no crea ni modifica nada**. No aparece en ninguna clave foránea del modelo.

Responde directamente al aviso de [[Usuarios y roles#Coordinador académico]]: "no se quiere convertir al coordinador en un administrador de toda la plataforma sin necesidad". Se descartó darle poder de asignar asesores para no meterlo en el flujo de escritura.

## Decisión 9 - Qué datos personales pide el registro

¿Qué datos se le piden a alguien al crear su cuenta, y cómo se cubre el consentimiento?

**Estado:** ✅ cerrada (2026-08-16) — **registro en dos pasos, con todos los campos de perfil y consentimiento registrado**

El registro pasa a tener dos pantallas: **paso 1** las credenciales (correo y contraseña, más el alta con Google cuando exista el OAuth Client ID) y **paso 2** el perfil. Es un solo `POST /api/auth/register` al final, así nadie queda con una cuenta a medio crear.

Campos del perfil: **nombre** (obligatorio), **rol**, **carrera**, **universidad u organización**, **teléfono** y **ubicación** (los cuatro últimos opcionales).

> [!warning] Se tomó sabiendo que hay tensión con la minimización de datos
> Se advirtió que **teléfono y ubicación no los usa ninguna funcionalidad** de TesisTrack, y que el principio de minimización de la Ley 29733 juega en contra de pedir datos que no son necesarios para la finalidad. El equipo confirmó igual que quiere los seis campos. Queda anotado acá para poder revisarlo si alguna vez se publica fuera del ámbito del curso.

Mitigación aplicada: los campos de perfil **no salen en `UserDto`**. Ese DTO viaja embebido en cada entrega, observación y tarea, así que exponerlos ahí publicaría el teléfono y la ubicación de una persona en respuestas que no los necesitan. Se guardan, pero no se difunden.

> [!note] Consecuencia sobre "universidad u organización"
> Es un **campo de texto libre en `users`**, no una entidad. La [[#Decisión 1 - Universidad específica o plataforma general]] sigue en pie: no hay tabla `Institución` ni permisos por institución.

**Consentimiento:** el registro exige un checkbox, y el backend guarda `politica_version` y `politica_aceptada_at`. Sin registro de la aceptación no se puede demostrar después que la persona consintió, que es justamente para lo que sirve. La versión vigente vive en `app.politica.version` (`application.properties`): si el texto cambia, hay que subirla.

> [!important] El coordinador no está en el selector de rol
> Y no puede estarlo: por la [[#Decisión 8 - Alcance del coordinador]] ese rol lee **todos** los proyectos de la plataforma. Si fuera autoasignable, cualquiera se registraría como coordinador y leería tesis ajenas. El backend ya lo rechazaba (`AuthService`); la UI ahora solo refleja esa regla.

Ver [[Desarrollo#Registro en dos pasos]].

## Decisión 10 - Áreas del asesor

¿El asesor puede crear sus propias "áreas", por ejemplo para distinguir si trabaja de forma privada o dentro de una institución educativa?

**Estado:** ✅ cerrada (2026-08-16) — **sí, pero como etiquetas privadas suyas, no como instituciones**

Un asesor con muchas tesis a la vez necesita agruparlas. Se le permite crear sus propias áreas (`Ingeniería de Software`, `UTEC – Posgrado`, `Consultorías privadas`) y etiquetar con ellas los proyectos que asesora.

> [!important] Lo que **no** es, y por qué
> Se descartó la lectura fuerte del pedido: **instituciones compartidas con miembros**, donde varios asesores y estudiantes pertenecen a una institución con permisos y administración propios. Eso es exactamente la entidad `Institución` que descartó la [[#Decisión 1 - Universidad específica o plataforma general|Decisión 1]], y arrastra invitaciones, roles dentro del área y un administrador — el "gestor administrativo universitario" que el [[Alcance]] excluye.
>
> La versión elegida **no toca la Decisión 1**: el área pertenece a un único asesor, no se comparte, y no otorga ni quita ningún permiso. `AccesoService` sigue resolviendo todo por pertenencia al proyecto.

**Modelo:** entidad `Area` con `nombre` y `propietario` (el asesor), `UNIQUE (propietario_id, nombre)`. `Proyecto.area` es opcional y nullable.

> [!note] Consecuencias
> - **Borrar un área no borra proyectos**: solo les despega la etiqueta. Se descartó bloquear el borrado cuando el área está en uso — es organizativa, no parte del proceso de tesis, y obligar a desetiquetar una por una sería un trámite sin valor. Desde que el área es un espacio con actividades, borrarla también se lleva esas actividades: ver la [[#Decisión 18 - Qué se lleva un espacio al borrarse|Decisión 18]].
> - **Cambiar el asesor de un proyecto le limpia el área**: era la etiqueta del asesor anterior y apuntaría a un área que el nuevo no puede ver.
> - **El área se ve en el DTO del proyecto**, así que el estudiante la vería si se la mostrara. Hoy la columna solo se renderiza para el asesor. Si se decidiera que debe ser invisible para el estudiante, hay que filtrarla en `ProyectoDto`.
> - Solo el rol `ASESOR` puede gestionar áreas; el estudiante recibe 403.

Ver [[Desarrollo#Áreas del asesor]].

## Decisión 11 - Cómo entran los asesorados de un asesor privado

> [!important] Ajustada por la Decisión 24 (2026-10-07)
> El código TT- sigue siendo de una **clase**. La asesoría privada pasa a ser opcional: tesis asignada al profesor **sin clase**, y elección por nombre solo entre quienes activaron esa preferencia. El texto siguiente documenta el flujo original; para el comportamiento actual, ver [[#Decisión 24 - Hacer opcionales las asesorías privadas]].

Un asesor privado ya sabe a quiénes asesora. ¿Cómo los suma a la plataforma, en vez de esperar a que lo encuentren en una lista?

**Estado:** ✅ cerrada (2026-08-16) — **código de invitación por área, al estilo de un código de clase**

Hasta acá el flujo iba al revés de lo que necesita un asesor privado: el estudiante creaba su tesis y **elegía a su asesor de una lista con todos los asesores de la plataforma**. El asesor era pasivo — su panel decía "el estudiante te elige al crear su proyecto" y no podía hacer nada al respecto.

Ahora cada [[#Decisión 10 - Áreas del asesor|área]] tiene un **código único** (`TT-XXXXXX`). El asesor se lo pasa por fuera (WhatsApp, correo, en persona) y el estudiante lo pega al crear su tesis —o después, con "Unirme con un código"—: queda con ese asesor y dentro de esa área.

> [!important] No reabre la Decisión 1 ni la 2
> Sigue sin haber entidad `Institución`, membresías ni permisos por área. Y **el estudiante sigue creando su propia tesis**: el código solo la deja pre-vinculada. Se descartó que el asesor cree el proyecto en nombre del estudiante, porque invertiría esa decisión y arrancaría la tesis con datos cargados por otra persona.

> [!note] Decisiones de detalle
> - **El código se muestra antes de confirmar**: el estudiante ve el nombre del asesor y del área. Un código mal tipeado que caiga en el de otro asesor se detecta ahí y no dos semanas después.
> - **Alfabeto sin caracteres ambiguos** (`0/O`, `1/I/L`, `5/S`, `8/B`, `2/Z`): se dicta y se copia a mano. ~482 millones de combinaciones.
> - **Límite de consultas por IP** al resolver códigos: sin eso se podrían probar en masa hasta colarse en el espacio de un asesor ajeno.
> - **Se acepta en minúsculas y con espacios**; el backend normaliza.
> - **El código se puede regenerar** si se filtró: el anterior deja de funcionar y quienes ya entraron no se ven afectados.
> - **El código no viaja en `ProyectoDto`** (`AreaDto.sinCodigo`): ese DTO también lo recibe el estudiante, y el código es la llave del espacio.
> - Se descartó **invitar por correo** porque necesita servicio de envío (SMTP/SendGrid), que no existe ni está desplegado — es un entregable en sí mismo.

**Panel de asesorados** (`GET /api/asesorados`, pantalla "Mis asesorados"): lista los estudiantes del asesor con su avance en hitos y **qué necesita atención** — hitos por revisar, observaciones sin resolver y tareas vencidas. Ordena primero a quienes esperan algo. Es una vista de solo lectura sobre lo que ya existe: no agrega entidades ni cambia permisos.

Ver [[Desarrollo#Carpetas con código de invitación]].

## Decisión 12 - Cómo se reparte una actividad a todo un espacio

Un asesor con veinte asesorados quiere dejar "Actividad 1" para todos. ¿Qué se crea, y qué pasa con el que se suma la semana siguiente?

**Estado:** ✅ cerrada (2026-08-16) — **una `Actividad` del área que genera un `Hito` por proyecto, y se reparte también a los que entran después**

Hasta acá los hitos se creaban **de a un proyecto por vez** (`POST /proyectos/{id}/hitos`). Con veinte asesorados, una consigna eran veinte altas a mano.

> [!important] La actividad es la plantilla; lo que se entrega sigue siendo el hito
> Se descartó que la actividad fuera la unidad que el estudiante entrega. Habría dos caminos paralelos para lo mismo y **la trazabilidad quedaría partida al medio**: las entregas, las observaciones y el ciclo de corrección cuelgan del hito. La cadena sigue siendo `Hito → Entrega → Observación`; la actividad solo la origina.
>
> `hito.actividad_id` es **nullable**: un hito cargado a mano en una tesis puntual sigue funcionando igual.

**El reparto es retroactivo.** Se engancha en `ProyectoService#sumarAlEspacio`, que es el único punto por donde se entra a un área —lo usan tanto crear la tesis con código como "Unirme con un código"—. Se descartaron las dos alternativas:

| Alternativa | Por qué no |
|---|---|
| Repartir solo a los que ya están | El que entra en septiembre no ve nada, y el asesor tiene que acordarse de cargárselo a mano. Es justo el trabajo que la decisión venía a eliminar |
| Elegir destinatarios con checkboxes | Más control, pero convierte cada actividad en un trámite. La actividad es del espacio, no de la tanda |

> [!note] Decisiones de detalle
> - **Guarda anti-duplicado** (`existsByProyectoIdAndActividadId`): alguien puede salir de un espacio y volver a entrar con el mismo código; sin esto terminaría con "Actividad 1" dos veces.
> - **Quitar una actividad no borra lo entregado.** Los hitos con entregas se **desenganchan** (`actividad = null`) y quedan como hitos comunes; solo se borran los que nadie tocó. Borrarlos se llevaría el historial que protege la [[#Decisión 4 - Modificación de hitos|Decisión 4]].
> - **Editar una actividad queda fuera de v1**: propagar un cambio a hitos que ya están en distintos estados es una decisión aparte.
> - **No reabre la Decisión 1.** El área sigue siendo de un solo asesor: no hay membresías, ni áreas compartidas, ni permisos por área.

### El semáforo

El tablero cruza asesorados × actividades. Traduce `EstadoHito` a **de quién es el turno**, que es lo que el asesor mira con veinte filas al frente:

| Semáforo | De dónde sale |
|---|---|
| 🟢 Listo | `COMPLETADO` |
| 🟡 Por revisar | `ENTREGADO` — la pelota la tiene el asesor |
| 🟠 Con observaciones | `OBSERVADO` — la pelota la tiene el estudiante |
| 🔴 En falta | `PENDIENTE`/`EN_PROCESO` **y** la fecha ya pasó |
| ⚪ Pendiente | `PENDIENTE`/`EN_PROCESO` en plazo |

`En falta` es el único que no sale del estado sino de la fecha. **Cada celda lleva su inicial además del color**, siguiendo el criterio de [[Arquitectura#Color de los estados]]: `OBSERVADO` y `COMPLETADO` son casi idénticos en deuteranopía.

Ver [[Desarrollo#Espacios de trabajo del asesor]].

## Decisión 13 - Quién puede abrir una asesoría

El asesor necesita un lugar donde sus asesorados le dejen dudas y pedidos de revisión. ¿Se agrega un canal nuevo, o alcanza con lo que hay?

**Estado:** ✅ cerrada (2026-08-16) — **el estudiante abre la asesoría; solo el asesor le agrega acuerdos**

Hasta acá `AsesoriaService#crear` exigía `verificarAsesorDelProyecto`: **el estudiante no podía registrar nada**. Como canal de consultas no servía.

Ahora `crear` usa `verificarLectura` y guarda en `registradaPor` a quien la abrió. `crearAcuerdo` **sigue siendo solo del asesor**.

> [!important] El estudiante plantea, el asesor resuelve
> La asimetría es deliberada: cualquiera de los dos puede dejar constancia de una conversación, pero **solo el asesor decide qué de eso se convierte en un acuerdo**, y de ahí en tarea. La cadena `Asesoría → Acuerdo → Tarea` conserva su autoridad; lo que se abre es la puerta de entrada, no la de salida.

| Alternativa | Por qué no |
|---|---|
| Entidad `Duda` o chat aparte | Una cadena paralela que el enunciado no pide, y la conversación quedaría **fuera de la trazabilidad** — justo lo que TesisTrack existe para dar |
| Que el estudiante responda sobre la observación | Sirve solo si la duda es sobre una entrega. Una consulta de método o de bibliografía no tiene dónde ir |

> [!note] Consecuencia
> Ajusta la matriz de [[Usuarios y roles#Matriz de permisos]] y matiza la [[#Decisión 7 - Permisos por rol|Decisión 7]]: es el primer caso donde el estudiante escribe en la cadena de asesorías. No toca la [[#Decisión 8 - Alcance del coordinador|Decisión 8]] — el coordinador sigue sin escribir nada.

Ver [[Desarrollo#Asesorías y consultas]].

## Decisión 14 - Qué hace el sistema cuando un asesor entra por primera vez

Al estudiante nuevo se le arregló el primer minuto con [[Desarrollo#Primeros pasos del estudiante nuevo (2026-08-16)|Primeros pasos]]. Al asesor no: seis de sus ocho pantallas le decían *"pasales el código de tu carpeta"* sin que esa carpeta existiera, y **ninguna ofrecía un botón**.

**Estado:** ✅ cerrada (2026-08-16) — **el Dashboard lo lleva a crear el espacio, y apenas lo crea, el código queda al frente para mandarlo**

> [!important] El asesor tiene un solo primer paso, no dos caminos
> A diferencia del estudiante —que podía llegar con código o sin él—, el asesor **siempre** empieza igual: no tiene a nadie hasta que crea su espacio. Por eso esta pantalla no pregunta, lleva directo al formulario.

Dos estados, uno después del otro:

1. **Sin espacio** → *"¿Es tu primera vez acá? Creá tu espacio de trabajo"* con el campo de nombre a la vista.
2. **Con espacio, sin nadie sumado todavía** → el código en grande, un botón que **copia un mensaje de invitación ya redactado** (no solo el código pelado), y un atajo a dejar la primera actividad.

> [!note] El código es el cuello de botella de todo el sistema
> Ningún asesorado puede entrar hasta que el asesor tenga y comparta ese código. Si no lo consigue en el primer minuto, no pasa nada más — por eso se prioriza sobre cualquier otro resumen o métrica en un Dashboard que todavía no tiene datos.

**Las seis pantallas que quedaban mudas** (Hitos, Entregas, Observaciones, Asesorías, Tareas y el propio Dashboard) ahora usan un `SinProyecto` que sabe distinguir rol: al asesor sin asesorados lo manda a "Mis espacios" con un botón, en vez de solo describirle un código que no tiene.

Ver [[Desarrollo#Primeros pasos del asesor nuevo]].

## Decisión 15 - Tesis grupales

El [[Entregable 0 - Conceptualización|Entregable 0]] dice "estudiante **o estudiantes** asociados", pero el modelo tenía un solo estudiante por proyecto. ¿Se ajusta el documento o el sistema?

**Estado:** ✅ cerrada (2026-08-16) — **el sistema. Una tesis puede tener varios estudiantes, todos con los mismos permisos**

Revierte el **supuesto 1** de [[Base de datos#Supuestos tomados al diseñar (no venían de una decisión)]], que se había tomado "de la forma más simple para poder avanzar" y estaba marcado para revisar. El documento del curso mandó.

`proyecto.estudiante_id` pasó a la tabla de unión `proyecto_estudiante`.

> [!important] No hay dueño ni jerarquía dentro del grupo
> Cualquier integrante entrega, se une a un espacio, suma o saca compañeros. Se descartó un rol de "líder": una tesis de dos personas no necesita burocracia interna, y el que la creó no tiene por qué ser el único que pueda entregar cuando el otro esté trabajando.

> [!note] Decisiones de detalle
> - **La lista nunca queda vacía**: `quitarEstudiante` se niega a sacar al último. Un proyecto sin estudiantes no le pertenecería a nadie y quedaría inalcanzable desde la aplicación.
> - **Se suma por correo, no eligiendo de una lista.** Listar a todos los estudiantes de la plataforma para elegir uno sería exponer el padrón entero; el correo lo sabe quien tiene que saberlo.
> - **Solo se puede sumar a alguien con rol estudiante**, y que ya tenga cuenta.
> - **La relación se carga `EAGER`**, al revés que el resto: `AccesoService` la necesita en cada request protegida, y sin eso serían consultas extra garantizadas más riesgo de `LazyInitializationException` al armar los DTO.
> - **Una tesis grupal ocupa una sola fila** en "Mis asesorados" y en el tablero, con los nombres juntos: entregan una vez, así que su avance es uno solo.

**Migración obligatoria** (Hibernate crea la tabla de unión pero no mueve datos ni borra columnas): copiar `estudiante_id` a `proyecto_estudiante` y recién ahí soltar la columna, que es `NOT NULL` y haría fallar todo alta nueva. En local: 11 proyectos, 11 vínculos, 0 huérfanos.

## Decisión 16 - Dónde se guardan los archivos de las entregas

Venía abierta desde el Entregable 1 y el documento promete "Archivo entregado". ¿S3, filesystem o base?

**Estado:** ✅ cerrada (2026-08-16) — **en PostgreSQL, en una tabla aparte, con tope de 15 MB**

| Alternativa | Por qué no |
|---|---|
| **Filesystem del servidor** | En AWS el disco no sobrevive a un redespliegue: los archivos se perderían al actualizar la app |
| **S3** | Es lo correcto para producción real, pero necesita cuenta, bucket, credenciales y configurarlo en el pipeline — depende de accesos que el grupo todavía no tiene, y bloquearía el Entregable 3 |

Una tesis en PDF pesa poco; para el alcance del curso la base alcanza de sobra y funciona igual en la máquina de cada uno y en AWS, sin configurar nada.

> [!important] Los bytes van en su propia tabla, no en `entrega`
> Un `byte[]` en la misma entidad se carga entero en cada consulta: listar diez versiones traería diez PDF a memoria para mostrar diez nombres. Marcarlo `LAZY` no alcanza —Hibernate solo lo respeta en atributos básicos con *bytecode enhancement*, que este proyecto no usa—, así que el contenido vive en `archivo_entrega` y solo la descarga lo toca. Los metadatos (nombre, tipo, tamaño) se quedan en `entrega` porque son baratos y se muestran siempre.

> [!warning] `@Lob` sobre `byte[]` en PostgreSQL es una trampa
> Hibernate lo mapea a `oid` (Large Object): guarda un puntero a `pg_largeobject`, hay que leerlo dentro de una transacción y **borrar la fila no borra el objeto**, así que se acumulan huérfanos. Se usa `columnDefinition = "bytea"` sin `@Lob`.

El enlace externo (`archivo_url`) **se mantiene** junto a la carga real: hay quien trabaja en Drive y prefiere compartir el enlace vivo en vez de una copia congelada.

### Estado de la entrega

El documento también pide "estado de la entrega". Se agregó `EstadoEntrega` —`EN_REVISION`, `OBSERVADA`, `APROBADA`— que **no duplica** a `EstadoHito`: el hito dice en qué anda el trabajo hoy, y esto queda como el veredicto de cada versión. Permite responder *"¿cuál fue la versión que el asesor aprobó?"* sin reconstruirlo desde las observaciones.

Registrar una observación marca la versión como `OBSERVADA` automáticamente; aprobar y reabrir los hace el asesor a mano.

Ver [[Desarrollo#Tesis grupales y archivos reales]].

## Decisión 17 - Quién puede borrar una tesis, y cómo

Hacía falta poder sacar proyectos de la lista —empezando por los de prueba—. ¿Quién borra, y qué se lleva puesto?

**Estado:** ✅ cerrada (2026-08-16) — **dos acciones distintas: quitar de la lista (segura) y borrar (irreversible, con confirmación escrita)**

> [!important] La acción segura existe porque la destructiva no se puede deshacer
> Ofrecer solo "Borrar" habría convertido *"esta tesis ya no me corresponde"* en *"destruí el trabajo de otra persona"*. Son intenciones distintas y ahora tienen botones distintos.

| Acción | Quién | Qué hace |
|---|---|---|
| **Quitar de mi lista** (`DELETE /proyectos/{id}/asesor`) | el asesor, o el grupo | Desvincula al asesor y limpia el área. **La tesis sigue entera**; el estudiante puede sumarse a otro espacio con un código |
| **Borrar** (`DELETE /proyectos/{id}`) | el grupo de la tesis, o su asesor | Elimina la tesis y **las dos cadenas completas** |

> [!warning] El borrado no tiene vuelta atrás
> Se lleva hitos, entregas con sus archivos, observaciones, asesorías, acuerdos y tareas. No hay papelera. Por eso la interfaz **pide escribir el título** en vez de un "¿estás seguro?": un botón de confirmación se acepta de memoria, escribir el título obliga a mirar cuál se está por borrar. El diálogo enumera qué se destruye y nombra a los tesistas.

> [!note] El borrado va explícito, no por `ON DELETE CASCADE`
> El [[Base de datos#Esquema SQL|esquema]] declara las claves foráneas con cascada, pero **`ddl-auto=update` no las genera**: las FK reales de la base no la tienen. Confiarse habría fallado recién en producción, con una violación de integridad. `ProyectoService#eliminar` borra en orden, de la hoja a la raíz, dentro de una transacción.
>
> Verificado después de borrar: **0 hitos, entregas, observaciones, archivos y vínculos huérfanos**.

> [!warning] Actualizado el 2026-10-07 — con Flyway las cascadas ya existen en una base nueva
> Desde la migración `V1` (Taller 2) una base nueva sí lleva `ON DELETE CASCADE` en 7 claves (`proyecto_estudiante`, `hito`, `entrega`, `observacion`, `asesoria`, `acuerdo` y `tarea`). El borrado **sigue yendo explícito** en el service: una base vieja creada con `ddl-auto=update` no las tiene, y el orden a la vista se razona mejor que una cascada. Ojo con lo que **no** lleva cascada: `actividad.area_id` y `hito.actividad_id`. Por eso borrar un espacio tuvo su propia decisión: la [[#Decisión 18 - Qué se lleva un espacio al borrarse|18]].

Se evaluó dejar el borrado solo al estudiante —la tesis es suya— pero el asesor también necesita limpiar lo que él mismo generó probando. La confirmación escrita es la que hace segura esa apertura.

## Decisión 18 - Qué se lleva un espacio al borrarse

Un asesor borra un espacio que ya tiene actividades y tesis. ¿Qué desaparece y qué queda?

**Estado:** ✅ cerrada (2026-10-07) — **se van las actividades y el código de invitación; las tesis y todos sus hitos se quedan**

Hasta acá `AreaService#eliminar` solo desvinculaba los proyectos del área ([[#Decisión 10 - Áreas del asesor|D10]]). Pero `actividad.area_id` es `NOT NULL REFERENCES area(id)` y `hito.actividad_id` apunta a la actividad: con una sola actividad creada —por ejemplo *"PRIMERA REUNION PARA CONOCERNOS"*— el `DELETE` violaba la clave foránea y el asesor veía **"Internal Server Error"**. Se reprodujo con el código anterior (500) y quedó corregido (204); un espacio vacío o sin actividades siempre se había podido borrar, que es lo que confirmó la causa.

El borrado va en este orden, dentro de una transacción: **se sueltan los hitos de las actividades (`actividad_id = NULL`) → se borran las actividades → se desvinculan los proyectos → se borra el área.**

> [!important] Ningún hito se borra, ni siquiera los que nadie tocó
> Es distinto de quitar **una** actividad ([[#Decisión 12 - Cómo se reparte una actividad a todo un espacio|D12]]), que sí borra los hitos sin entregas para no dejar basura. Acá el asesor se va del espacio, no está limpiando una consigna: los hitos son trabajo del estudiante, y quitarle hitos a veinte tesis porque el asesor cerró su carpeta castigaría a quien no hizo nada.

| Alternativa | Por qué no |
|---|---|
| Bloquear el borrado si el espacio tiene actividades o tesis | Ya se descartó en la [[#Decisión 10 - Áreas del asesor\|D10]]: obligar a vaciar el espacio a mano es un trámite sin valor |
| Borrar también los hitos sin entregas | Ver el cuadro de arriba: no es limpiar una consigna, es irse del espacio |
| `ON DELETE SET NULL` / `CASCADE` en las claves foráneas | Exigía una migración Flyway para algo que cabe en el service, y el orden explícito se razona mejor. Mismo criterio que la [[#Decisión 17 - Quién puede borrar una tesis, y cómo\|D17]] |

**Confirmación escrita**, como en la D17: la interfaz pide escribir el nombre del espacio y separa dos listas. *Se pierde*: las actividades con su tablero y el código de invitación. *No se pierde*: las tesis, con sus entregas y observaciones, y los hitos que nacieron de las actividades, que quedan como hitos comunes. El diálogo cuenta las actividades y las tesis reales en vez de decir "algunas cosas".

> [!note] Consecuencia — un 500 pelado no vuelve a llegar a la pantalla
> - `ApiExceptionHandler` traduce `DataIntegrityViolationException` a **409** con un mensaje legible; el detalle técnico (restricción, SQL) va solo al log.
> - `client.js` reemplaza cualquier 5xx por *"Algo falló de nuestro lado…"* en vez de mostrar el `Internal Server Error` que devuelve Spring.
> - Desde la Fase 1, borrar el espacio también se lleva sus **materiales** (carpetas, enlaces y archivos subidos) y sus **sesiones**, y el diálogo los lista con números reales: `GET /areas/{id}/resumen`. Ver las decisiones [[#Decisión 19 - Cómo se organizan los materiales del espacio|19]] y [[#Decisión 20 - Reuniones con enlace - sesiones del espacio y asesorías programadas|20]].

Ver [[Desarrollo#Fase 0 - Errores corregidos (2026-10-07)]].

## Decisión 19 - Cómo se organizan los materiales del espacio

El espacio tiene que servir como un aula: el asesor deja los temas de tesis, la rúbrica, las clases. ¿Dónde vive ese material, de qué es y quién lo ve?

**Estado:** ✅ cerrada (2026-10-07) — **carpetas del espacio con materiales que son un enlace o un archivo; el dueño arma y edita, los miembros solo ven y descargan**

Modelo: `carpeta_material` → `material` → `archivo_material`. Un material es **un enlace o un archivo, nunca ambos ni ninguno**: lo garantiza un `CHECK` en la base, no solo el service.

> [!important] Los enlaces tienen que ser `https://`
> Un enlace que llega a otras personas y se abre con un clic no puede ser un `javascript:` ni un `http://` sin cifrar. Se valida en el service **y** se repite como `CHECK` en la base, así que ni una escritura que se salte la aplicación guarda otra cosa. El esquema se normaliza a minúsculas (`HTTPS://` → `https://`).

Los **archivos** siguen la [[#Decisión 16 - Dónde se guardan los archivos de las entregas|Decisión 16]] sin cambios: `bytea` en una tabla aparte (nunca `@Lob`, para que listar una carpeta no arrastre los PDF a memoria), tope de 15 MB. Se suben **en un solo paso** (multipart con el título), a diferencia de las entregas, que van en dos: un material no existe sin su contenido, así que no hay un estado "creado pero vacío" que cuidar. Se sirven como `attachment` —el archivo lo subió una persona, y abrirlo en línea dentro del origen de la aplicación sería ejecutar contenido ajeno— y el nombre se recorta al último tramo de la ruta, porque algunos navegadores mandan `C:\Users\…\tesis.pdf`.

**Carpetas sugeridas:** todo espacio nuevo nace con *Temas de tesis*, *Rúbrica* y *Clases*, editables y borrables como cualquier otra. La migración `V2` se las dio a los espacios que ya existían.

**Quién ve qué** — la regla de siempre, pertenencia: el **dueño** crea, renombra y borra; los **estudiantes con una tesis en ese espacio** ven y descargan, y no ven las carpetas vacías (una carpeta sin nada no les dice nada); el **coordinador** puede leer, por la [[#Decisión 8 - Alcance del coordinador|Decisión 8]]. Un estudiante ajeno al espacio y otro asesor reciben 403.

| Alternativa | Por qué no |
|---|---|
| Material colgando de cada tesis | El material es del aula, no de cada tesis. Subirlo veinte veces es el trámite que la [[#Decisión 12 - Cómo se reparte una actividad a todo un espacio\|D12]] ya había eliminado para las actividades |
| Material adjunto a la actividad | La actividad es una consigna que se reparte como hito; la rúbrica o una clase grabada sirven fuera de cualquier consigna |
| Solo enlaces (Drive) | Hay quien prefiere subir el PDF; y la D16 ya resolvió dónde viven los archivos |
| Carpetas anidadas | Complejidad sin valor para el volumen de un espacio: un nivel alcanza |
| Que el estudiante también suba | Rompe la regla "el asesor arma, el estudiante ve"; lo suyo ya tiene su lugar en las entregas |

> [!note] Consecuencia
> Borrar una carpeta o un material **se lleva los archivos subidos y no se recupera**: la interfaz pide confirmar y cuenta cuántos son. El tope de 15 MB devuelve **413** con *"El archivo supera los 15 MB"* (antes era el "Payload Too Large" genérico de Spring).

Ver [[Desarrollo#Fase 1 - El espacio como aula (2026-10-07)]] y [[Base de datos#Migración V2 - materiales y reuniones]].

## Decisión 20 - Reuniones con enlace - sesiones del espacio y asesorías programadas

Una reunión virtual necesita un enlace, una hora y que los dos lados lo tengan a mano. ¿Se integra Zoom o Meet, y qué se agrega a lo que ya había?

**Estado:** ✅ cerrada (2026-10-07) — **el enlace se pega a mano (sin integrar ninguna API); la sesión es del espacio, la asesoría es de la tesis, y la asesoría gana un ciclo de estado**

> [!important] No se integra Zoom ni Meet
> Integrarlos es un entregable en sí mismo (credenciales y OAuth por asesor, cuotas, renovación de tokens) y el valor —que el estudiante tenga el enlace y un botón para entrar— se obtiene igual pegándolo. El asesor crea la reunión donde prefiera. El enlace se valida como `https://` (service y `CHECK`), igual que en la [[#Decisión 19 - Cómo se organizan los materiales del espacio|Decisión 19]].

**Dos alcances distintos:**
- **Sesión del espacio** (`sesion_espacio`): una clase para todos los miembros, con título, fecha y hora y enlace. La crea, edita y borra el dueño; la ven todos con un botón **Unirse**.
- **Asesoría de una tesis** (`asesoria`): hasta ahora solo registraba una reunión que ya pasó. Gana `estado` y `enlace`.

**El ciclo de la asesoría** — `PROGRAMADA → REALIZADA | CANCELADA`:

| Quién | Puede |
|---|---|
| Asesor **o** el estudiante que la programó | Programarla, reprogramarla (mientras esté `PROGRAMADA`) y cancelarla |
| Solo el **asesor** | Marcarla `REALIZADA` y completar el resumen |
| Nadie | Cambiar una `REALIZADA` o `CANCELADA`: son historia |

Las asesorías que ya existían eran reuniones registradas después de ocurrir, así que la migración las dejó `REALIZADA`. Sin `estado` en la petición se sigue registrando como `REALIZADA`, que es lo que siempre hizo; agendar es optar por `PROGRAMADA`. Una asesoría **no puede nacer cancelada**. El enlace es opcional: la reunión puede ser presencial.

> [!important] Solo una asesoría realizada admite acuerdos
> No se puede acordar nada en una reunión que no se hizo: registrar un acuerdo sobre una `PROGRAMADA` o `CANCELADA` da 400. La cadena `Asesoría → Acuerdo → Tarea` queda intacta; lo único que cambia es que ahora arranca recién cuando la reunión se marca realizada.

Esto **conserva la asimetría de la [[#Decisión 13 - Quién puede abrir una asesoría|Decisión 13]]**: el estudiante puede *proponer* una reunión y cancelar la que él abrió, pero marcarla realizada y decidir los acuerdos sigue siendo del asesor. Un compañero de una tesis grupal que no la abrió no la reprograma ni la cancela.

**Próximas reuniones** (`GET /reuniones/proximas`): las sesiones del espacio y las asesorías programadas del usuario, en una sola lista, las cinco más cercanas. Las muestran **los dos Dashboards**, con la primera destacada y su botón Unirse. Una reunión que empezó hace menos de una hora **sigue apareciendo**: quien llega tarde a una clase en curso todavía necesita el botón. El coordinador no tiene reuniones propias. El bloque *Últimas asesorías* del Dashboard pasó a mostrar solo las realizadas; las programadas viven en *Próximas reuniones*.

| Alternativa | Por qué no |
|---|---|
| Integrar la API de Zoom o Meet | Ver el cuadro de arriba: costo de un entregable para ganar un enlace que se pega en diez segundos |
| Solo sesiones del espacio, sin programar asesorías | Las tesis tienen reuniones individuales, y la cadena asesoría → acuerdo → tarea necesita que la reunión exista **antes** de que ocurra |
| Una entidad `Reunion` unificada | Duplicaría la cadena de trazabilidad: la misma razón por la que la D13 descartó una entidad `Duda` |
| Que solo el asesor programe | El estudiante necesita poder proponer una reunión; es la apertura de la D13 |

Ver [[Desarrollo#Fase 1 - El espacio como aula (2026-10-07)]] y [[API#Sesiones del espacio]].

## Decisión 21 - Unificar el vocabulario de la interfaz

¿Qué nombres ve cada rol para dejar de mezclar área, espacio, carpeta y proyecto?

**Estado:** ✅ cerrada (2026-10-07) — **Clase, Grupo y Mi tesis, sin renombrar el modelo técnico**.

El profesor entra por **Mis clases**; dentro de una clase cada tesis es un **grupo**, incluso si tiene una sola persona. El estudiante entra por **Mi tesis** y **Mi clase**. **Carpeta** se reserva para materiales; **asesorados** queda en Asesorías privadas, el perfil y su pregunta inicial. Aplica a botones, títulos, ayudas, errores y estados vacíos. Las rutas antiguas del frontend redirigen a las nuevas.

**Alternativa descartada:** renombrar tablas, entidades Java y rutas REST. Agregaba migraciones y rompía consumidores sin aportar claridad adicional a la interfaz; `area`, `proyecto`, `/areas` y `/proyectos` conservan su contrato técnico.

> [!note] Consecuencia
> El vocabulario se verificó en navegador para profesor, estudiantes, coordinador, estados vacíos y pantallas públicas. Ver [[Desarrollo#Fase 1.5 - Clases y vistas (2026-10-07)]].

## Decisión 22 - Organizar la clase como salón con pestañas

¿Cómo se separan los avisos, el trabajo y la gestión de una clase?

**Estado:** ✅ cerrada (2026-10-07) — **Tablón, Trabajo de clase, Personas, Seguimiento y Configuración**.

El profesor ve las cinco pestañas. El estudiante ve Tablón, Trabajo de clase y Personas. El Tablón reúne avisos y próximas sesiones; Trabajo de clase reúne actividades y carpetas de materiales. Seguimiento conserva el semáforo; Configuración permite renombrar, regenerar código y borrar con confirmación escrita reutilizando `BorrarEspacio`.

**Interpretaciones implementadas para revisión de Oscar:** avisos como **texto simple**, sin editor rico ni comentarios; **quitar de la clase actúa sobre el grupo completo**, reutilizando la desvinculación de la D17: deja de estar en esa clase y a cargo del profesor, pero conserva tesis, integrantes e historial. No equivale a expulsar a una sola persona de su tesis.

Personas muestra primero al profesor y después los grupos. El dueño ve nombres, correos, tema o *Tema por definir*, semáforo e ingreso. El estudiante ve los nombres de otros grupos; correos, tema, identificador de tesis y fecha de ingreso ajenos se ocultan en la API. Su propio grupo conserva esos datos. El coordinador mantiene lectura global, sin gestión.

**Alternativas descartadas:** una única página extensa dificulta encontrar cada tarea; avisos con HTML/comentarios agregan edición y moderación fuera del pedido; quitar personas desde la clase cambiaría la composición de una tesis y contradice la acción segura de la D17.

Ver [[Usuarios y roles#Clases y privacidad de Personas]] y [[API#Clases - Personas y avisos]].

## Decisión 23 - Mostrar un Dashboard agregado del profesor

¿Qué necesita ver el profesor al entrar cuando atiende varias clases y tesis?

**Estado:** ✅ cerrada (2026-10-07) — **próximas reuniones, clases, entregas para revisar y grupos que necesitan atención**.

`GET /dashboard/asesor` agrega solo sus clases y tesis. *Para revisar* agrupa las entregas EN_REVISION por hito y muestra la versión pendiente de mayor número de cada uno; las ordena de la más antigua a la más reciente, con enlace a la tesis e hito correctos. Esta agrupación es una interpretación implementada para revisión de Oscar. *Necesitan atención* reúne grupos atrasados y sin tema. Las próximas reuniones siguen viniendo de `/reuniones/proximas`.

**Semáforo del grupo:** ROJO si algún hito está EN_FALTA; AMARILLO si hay POR_REVISAR u OBSERVADO; VERDE si tiene hitos y no se cumplen los casos anteriores; SIN_ACTIVIDAD si no tiene hitos. Una entrega pendiente de revisión queda amarilla. El cálculo usa todos los hitos de la tesis, incluidos los que no provienen de una actividad de clase.

**Alternativa descartada:** mostrar el Dashboard de la primera tesis elegida, porque oculta el resto de la carga del profesor. Calcular cada tarjeta desde el frontend exigiría recorrer tesis/hitos/entregas en múltiples solicitudes y repartir la lógica de pertenencia.

> [!note] Consecuencia
> No hay acceso global por tener rol ASESOR. El endpoint y los enlaces mantienen los chequeos de pertenencia. Ver [[API#Dashboard del profesor]].

## Decisión 24 - Hacer opcionales las asesorías privadas

¿Todos los profesores necesitan una sección de asesorados privados?

**Estado:** ✅ cerrada (2026-10-07) — **preferencia opcional y persistida; ajusta la D11**.

Al primer ingreso se pregunta *¿Das asesorías privadas, fuera de una clase?*; después se modifica en Mi perfil. `users.asesorias_privadas` es nullable: NULL = sin responder; TRUE/FALSE = respuesta. Solo TRUE muestra Asesorías privadas en el menú. Con FALSE se explica una vez: *Asesorías privadas es para acompañamiento personal, uno a uno. Si trabajás con una organización o con grupos, usá Mis clases.*

**Interpretación implementada:** asesorado privado = **tesis asignada al profesor sin clase**. `GET /asesorados` excluye tesis de clase. Borrar una clase conserva al profesor asignado, por lo que sus tesis pasan a estar sin clase; quitar un grupo desde Personas desvincula también al profesor según la D17. No se puede desactivar la preferencia mientras queden tesis privadas: primero hay que desvincularlas conscientemente. Esta preferencia organiza el menú y la captación; no elimina permisos existentes sobre tesis asignadas.

La lista de profesores que el estudiante puede elegir por nombre se filtra a quienes activaron privadas. La API también rechaza una asignación por nombre a quien no las ofrece; entrar con el código de una clase sigue funcionando cualquiera sea su preferencia.

**Alternativas descartadas:** mostrar siempre Mis asesorados confunde a quien trabaja exclusivamente con clases; usar una clase denominada Privadas mezcla dos flujos que el pedido separa; crear una entidad o rol de asesor privado duplica el seguimiento existente.

> [!question] Pendiente de confirmación de Oscar
> ¿Las asesorías privadas necesitan un **código personal**? No se implementó: el código actual sigue perteneciendo a una clase. También debe confirmar la definición de privado y el filtro del selector de profesores.

Ver [[#Decisión 11 - Cómo entran los asesorados de un asesor privado]], [[Base de datos#Migración V3 - clases, avisos y archivos verificados]] y [[API#Perfil y asesorías privadas]].

## Decisión 25 - Previsualizar solo archivos con tipo verificado

¿Cómo permitir Ver en materiales y entregas sin confiar en el tipo declarado al subir?

**Estado:** ✅ cerrada (2026-10-07) — **magic bytes para PNG, JPEG, GIF, WebP y PDF; el resto solo descarga**.

`ArchivoTipos` reconoce la firma de los bytes y guarda el tipo detectado. SVG, HTML, Word, PowerPoint y formatos desconocidos quedan como `application/octet-stream`; nunca se ofrecen para vista previa. La migración V3 vuelve a verificar también los archivos legacy de materiales y entregas, aunque ya tuvieran un tipo declarado, sin modificar su contenido.

El botón **Ver** abre un modal: `fetch` autenticado → Blob con el MIME verificado → `URL.createObjectURL`; imágenes en `img`, PDF en `iframe`. La URL se revoca al cerrar o desmontar. La descarga conserva `Content-Disposition: attachment`. Para los demás formatos se explica que hay que descargar para abrirlos.

**Alternativas descartadas:** confiar en extensión o Content-Type permite disfrazar HTML/SVG; usar la URL del servidor directamente en el iframe no envía el bearer token y altera el contrato de descarga; convertir Word/PPT agrega motores y dependencias fuera del alcance. La firma identifica el formato: no pretende validar íntegramente el documento ni analizar malware.

> [!note] Cambios asociados para revisión de Oscar
> El enlace externo de una entrega ahora exige **https**. La política de privacidad refleja Personas y las asesorías privadas; `app.politica.version=2026-10-07`. No se reescriben consentimientos anteriores ni se implementa una nueva pantalla de reaceptación.

Ver [[API#Archivos verificados y vista previa]] y [[Base de datos#Migración V3 - clases, avisos y archivos verificados]].

## Ver también
- [[Feedback profesor]]
- [[TesisTrack]]
