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
> De la **9** a la **14** surgieron durante el [[Entregables y evaluación|Entregable 3]]: al rediseñar el registro, al ordenar la carga de trabajo del asesor, al resolver cómo un asesor privado suma a sus asesorados, al repartir una consigna a todo un espacio, al abrir las asesorías como canal de consultas y al arreglar el primer minuto del asesor nuevo.
>
> No quedan decisiones abiertas. Las que surjan de acá en adelante se agregan a esta nota con su fecha.

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
> - **Borrar un área no borra proyectos**: solo les despega la etiqueta. Se descartó bloquear el borrado cuando el área está en uso — es organizativa, no parte del proceso de tesis, y obligar a desetiquetar una por una sería un trámite sin valor.
> - **Cambiar el asesor de un proyecto le limpia el área**: era la etiqueta del asesor anterior y apuntaría a un área que el nuevo no puede ver.
> - **El área se ve en el DTO del proyecto**, así que el estudiante la vería si se la mostrara. Hoy la columna solo se renderiza para el asesor. Si se decidiera que debe ser invisible para el estudiante, hay que filtrarla en `ProyectoDto`.
> - Solo el rol `ASESOR` puede gestionar áreas; el estudiante recibe 403.

Ver [[Desarrollo#Áreas del asesor]].

## Decisión 11 - Cómo entran los asesorados de un asesor privado

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

## Ver también
- [[Feedback profesor]]
- [[TesisTrack]]
