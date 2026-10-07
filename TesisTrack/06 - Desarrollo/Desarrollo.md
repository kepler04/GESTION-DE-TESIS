---
title: Desarrollo
tags:
  - desarrollo
---

# Desarrollo

> [!success] Estado al 2026-10-07 — Entregables 1, 2 y 3 hechos en funcionalidad; el 4 empezado
> Modelo de datos, API y panel cubren todo lo de [[Funcionalidades]]. Desde agosto entraron el **Taller 2** (Flyway, MapStruct, Lombok — 2026-09-20) y la parte de Docker del **Entregable 4** (2026-10-03). Se está en la tanda de **cierre**: la Fase 0 de errores ([[#Fase 0 - Errores corregidos (2026-10-07)]]) y la Fase 1, el espacio del asesor como aula ([[#Fase 1 - El espacio como aula (2026-10-07)]]); falta el primer ingreso del estudiante en grupo.

> [!warning] La [[Auditoría de requisitos]] es del 2026-08-16
> Su recuento de nota ("45% sin empezar") está desfasado: el Entregable 4 ya tiene imágenes Docker y un pipeline que las publica (ver más abajo). Lo que sigue valiendo es su regla: **antes de construir, verificar si está en [[Funcionalidades]]**.

> [!info] Cómo se trabaja ahora
> Ramas + **pull request**; Alonso Castro revisa. Nada de push directo a `main`. Cada cambio de esquema es una migración Flyway nueva ([[Base de datos#Motor]]). El código vive en `D:\UTEC 2` (clon de GitHub). `CLAUDE.md` se quitó del repo el 2026-09-20; la skill del vault (`.claude/skills/vault`) sí se versiona.

## Repositorio

**Monorepo** → https://github.com/kepler04/GESTION-DE-TESIS

| Carpeta | Qué es |
|---|---|
| `tesistrack-app/` | Backend — Spring Boot 4, Java 17, API REST, PostgreSQL, Flyway |
| `tesistrack-web/` | Frontend — React 18.3.1 + Vite |
| `TesisTrack/` | Copia versionada de este vault |
| `TALLER-02/` | Índice de evidencias del Taller 2 |
| `.github/workflows/` | `imagen-backend.yml` e `imagen-frontend.yml` |
| `docker-compose.yml` | Stack completo: base + backend + frontend con nginx |

> [!warning] El vault se edita en `E:\GENERAL\TesisTrack`
> La carpeta `TesisTrack/` del repo es una **copia**. Se sincroniza antes de commitear con
> `robocopy "E:\GENERAL\TesisTrack" "D:\UTEC 2\TesisTrack" /MIR`.
> Si editás la copia directamente, el próximo sync la pisa. *(Hasta el 2026-10-06 la ruta era `e:\CLAUDE\UTEC\TesisTrack`; esa carpeta ya no existe.)*

Ver el stack y el porqué de cada decisión en [[Arquitectura]].

## Cómo levantar el proyecto

### Todo en Docker (lo más simple)

```
docker compose up -d --build     # desde la raíz del repo → http://localhost:3000
```

Tres contenedores: `db` (PostgreSQL 16), `backend` y `frontend` (nginx, que reenvía `/api` al backend). **Solo se publica el 3000**; la base y el backend quedan internos, así que no choca con un PostgreSQL local en el 5432. Los datos viven en un volumen: `docker compose down` los conserva, `docker compose down -v` los borra. Hay que reconstruir (`--build`) después de cambiar código.

### Desarrollo con recarga automática

```
# 1. Base de datos. Si el 5432 está libre:  docker compose up -d db   (desde tesistrack-app)
#    Si lo ocupa un PostgreSQL local, usar otro puerto:
docker run -d --name tesistrack-db -e POSTGRES_DB=tesistrack -e POSTGRES_USER=tesistrack \
  -e POSTGRES_PASSWORD=tesistrack -p 5433:5432 postgres:16

# 2. Backend (desde tesistrack-app) → :8080
DB_PORT=5433 ./mvnw.cmd spring-boot:run        # PowerShell: $env:DB_PORT="5433"; .\mvnw.cmd spring-boot:run

# 3. Frontend (desde tesistrack-web) → :5173
npm run dev
```

> [!important] El frontend queda en el 5173 y le habla al backend por proxy
> `vite.config.js` fija el puerto con `strictPort` y reenvía `/api` al 8080: el navegador solo ve el 5173 (mismo origen), igual que con nginx en Docker. Si el 5173 está ocupado, Vite **falla** en vez de saltar a otro puerto. Ver [[#Fase 0 - Errores corregidos (2026-10-07)]].

### Usuarios de prueba

**Ya no vienen cargados**: una base nueva arranca vacía. Se registra un asesor y un estudiante desde `/registro`. *(Los `prueba@tesistrack.com` / `asesor@tesistrack.com` eran de la base local vieja, creada antes de Flyway.)*

## Avance

**Entregable 1 — Modelo de datos** ✅
- [x] Las 4 decisiones que bloqueaban el esquema (1, 3, 5, 6)
- [x] Diagrama ER y esquema SQL — ver [[Base de datos]]
- [x] 7 entidades JPA + repositorios sobre el `User` que ya existía
- [x] Verificado contra PostgreSQL real: 8 tablas, 13 claves foráneas y el `UNIQUE (hito_id, version)`

**Entregable 2 — Backend** ✅
- [x] Las 4 decisiones de permisos (2, 4, 7, 8)
- [x] 25 endpoints REST documentados en [[API]]
- [x] Autorización por pertenencia al proyecto, no solo por rol
- [x] 31 pruebas end-to-end recorriendo el flujo de [[Reglas de negocio]] y cada regla de permiso

**Entregable 3 — Aplicación full-stack** 🔨 en curso
- [x] Login y registro con JWT, con diseño propio
- [x] React Router + `AuthContext` + rutas protegidas
- [x] Panel con barra lateral; el menú se arma según el rol
- [x] Dashboard, Proyectos e Hitos consumiendo la API
- [x] Landing pública en `/`, separada del panel
- [x] **Entregas** (2026-08-16) — versiones por hito, con el ciclo de corrección visible
- [x] **Registro en dos pasos + política de privacidad** (2026-08-16)
- [x] **Observaciones** (2026-08-16) — el asesor observa y resuelve sobre cada versión
- [x] **Carpetas con código de invitación** (2026-08-16) — el asesor invita, el estudiante se suma
- [x] **Primeros pasos** (2026-08-16) — el estudiante nuevo elige entre entrar con código o sin él
- [x] **Espacios de trabajo** (2026-08-16) — una actividad para todo el espacio + tablero con semáforo
- [x] **Primeros pasos del asesor** (2026-08-16) — del registro al código para invitar, sin pantallas mudas
- [x] **Mis asesorados** (2026-08-16) — el panel del asesor sobre sus estudiantes
- [x] **Telón de bienvenida** al entrar al panel (2026-08-16)
- [x] **Asesorías + Acuerdos** (2026-08-16) — también es el canal de consultas del estudiante
- [x] **Tareas** (2026-08-16) — con responsable, vencimiento y el acuerdo del que salen
- [x] **Tesis grupales** (2026-08-16) — varios estudiantes por tesis, todos con los mismos permisos
- [x] **Subida real de archivos** (2026-08-16) — el documento se guarda en PostgreSQL
- [ ] Resolver el menú del coordinador, que contradice la [[Decisiones pendientes|Decisión 8]] (ver más abajo)

> [!success] Las funcionalidades de [[Funcionalidades]] están completas
> No queda ninguna pantalla en `PendientePage` —el componente se borró— y **"Subir documento" ya funciona**. El Entregable 3 está cerrado salvo el detalle del menú del coordinador.

### Pantalla de Entregas

Las entregas cuelgan de un hito, no del proyecto, así que la pantalla pide primero qué hito mirar. Preselecciona el hito "en juego" —el `OBSERVADO`, si no el `ENTREGADO`, si no el `EN_PROCESO`— porque es contra ese que el estudiante viene a entregar. Las versiones se listan de la más nueva a la más vieja, con la última marcada como *actual*.

> [!note] El ciclo de corrección se ve en vivo
> Al registrar una versión, el backend mueve el hito a `ENTREGADO` aunque viniera `OBSERVADO` — es el retorno de la [[Decisiones pendientes|Decisión 3]]. La pantalla recarga los hitos después de entregar para que el badge no quede mostrando el estado viejo, y el formulario lo avisa antes de confirmar.

> [!warning] Todavía no sube archivos de verdad
> Mientras no se decida S3 vs. filesystem, el formulario registra el **nombre** del archivo y, opcionalmente, un **enlace** a donde esté. Es deliberado: no se improvisa un almacenamiento que después haya que migrar. El aviso está a la vista en el formulario para no simular una función que no existe.

Solo el estudiante del proyecto puede entregar (`verificarEstudianteDelProyecto`); el asesor y el coordinador la ven en modo lectura y no reciben el botón.

> [!important] El menú le esconde Entregas al coordinador
> `AppLayout` filtra el menú del coordinador a Dashboard, Proyectos e Hitos, pero la [[Decisiones pendientes|Decisión 8]] dice que puede **consultar** entregas, asesorías y tareas. La API se lo permite; el menú no se lo ofrece. Queda por resolver si se abre el menú o se acota la Decisión 8.

### Carpetas con código de invitación

Ver [[Decisiones pendientes#Decisión 11 - Cómo entran los asesorados de un asesor privado]] para el porqué.

**El asesor** ve sus carpetas y el código de cada una **siempre a la vista** en Proyectos, con botón de copiar. "Administrar" abre el panel para crear, renombrar, borrar o generar un código nuevo.

> [!warning] Corregido el 2026-08-16 — la carpeta no se veía sin proyectos
> La primera versión escondía las carpetas detrás del botón "Mis áreas" y solo mostraba la tabla de proyectos. Un asesor recién llegado entraba, veía "no tenés proyectos asignados" y **ni rastro del área que acababa de crear**. Era al revés de lo que necesita: sin el código a mano no puede invitar a nadie, y sin invitar nunca va a tener proyectos.
>
> Ahora las carpetas van siempre visibles y el estado vacío explica el siguiente paso en vez de solo informar que no hay nada.

**El estudiante** lo usa en tres lugares: un campo *Código de invitación* al crear su tesis (que bloquea el selector de asesor, porque el código manda), el botón **"Unirme con un código"** en Proyectos si su tesis ya existía, y un aviso en el **Dashboard** cuando su tesis todavía no tiene asesor.

> [!warning] Corregido el 2026-08-16 — unirse estaba enterrado
> El mecanismo existía desde el principio, pero el único acceso visible estaba en Proyectos, detrás de un botón secundario. Un estudiante que creaba su tesis sin código quedaba en un panel vacío, sin ninguna pista de cómo sumarse al espacio de su asesor.
>
> **Una tesis sin asesor no avanza**: no hay quien cargue hitos ni revise entregas. Así que el Dashboard ahora abre con el aviso *"Tu tesis todavía no tiene asesor"* y el flujo de unirse ahí mismo; el botón de Proyectos pasa a primario en ese estado; y el estado vacío del panel menciona el código en vez de solo decir "creá un proyecto".

La previsualización antes de confirmar (nombre del área y del asesor) es deliberada: un código mal tipeado que caiga en el de otro asesor se detecta ahí, y no dos semanas después.

#### Primeros pasos del estudiante nuevo (2026-08-16)

El estudiante que entra por primera vez **no ve un panel vacío**: ve una pregunta.

> **¿Es tu primera vez acá?** — Empecemos por tu tesis
> `[ Tengo un código ]` `[ Todavía no tengo código ]`

De ahí salen dos recorridos, y la bifurcación es lo primero porque **el código no se usa igual en los dos casos**:

| Camino | Qué pasa |
|---|---|
| Con código | Se previsualiza carpeta y asesor → se pide el título → el proyecto **nace con asesor asignado** |
| Sin código | Solo el título; el proyecto nace huérfano y el Dashboard le ofrece unirse después |

> [!important] Para el estudiante nuevo el código va en `POST /proyectos`, no en `PATCH /unirse`
> `PATCH /proyectos/{id}/unirse` necesita un proyecto que todavía no existe. Por eso `CrearProyectoRequest` acepta `codigoInvitacion`: es el único camino para quien llega con el código antes que con la tesis. Los dos endpoints existen porque cubren momentos distintos, no porque estén duplicados.

> [!note] Por qué no alcanzaba con el formulario que ya existía
> El campo *Código de invitación* estaba en el alta de proyecto desde el principio, pero como **un campo más** entre el título y el selector de asesor. Quien llegaba con un código en la mano no tenía forma de saber que ese era su camino. Preguntar primero convierte un campo opcional en un recorrido.

Un código inexistente corta antes de crear nada: muestra *"Ese código de invitación no existe"* y no llega a pedir el título.

**Pantalla "Mis asesorados"** (solo en el menú del rol `ASESOR`): una tarjeta por estudiante con su avance en hitos y los pendientes que le tocan al asesor. Borde naranja si espera algo, verde si está al día.

**Endpoints:** `GET /api/areas/invitacion/{codigo}` (con límite por IP), `PATCH /api/proyectos/{id}/unirse`, `POST /api/areas/{id}/codigo`, `GET /api/asesorados`. `CrearProyectoRequest` acepta `codigoInvitacion`.

> [!warning] Migración de `area.codigo`
> La columna es `NOT NULL UNIQUE` y ya había áreas creadas, así que `ddl-auto=update` no podía agregarla sola. Se corrió a mano: agregar la columna nullable → rellenar con códigos únicos generados con el mismo alfabeto → `SET NOT NULL` + constraint `UNIQUE`. **Hay que repetirlo en producción** si ya existen áreas.

```sql
ALTER TABLE area ADD COLUMN IF NOT EXISTS codigo varchar(12);
-- (bucle que genera un código libre por cada fila con codigo IS NULL)
ALTER TABLE area ALTER COLUMN codigo SET NOT NULL;
ALTER TABLE area ADD CONSTRAINT area_codigo_key UNIQUE (codigo);
```

### Espacios de trabajo del asesor

Ver [[Decisiones pendientes#Decisión 12 - Cómo se reparte una actividad a todo un espacio]] para el porqué y qué se descartó.

Cada carpeta tiene ahora un botón **"Abrir espacio"** que lleva a `/espacios/:areaId`. Ahí el asesor:

- ve el **código para invitar**, con botón de copiar;
- deja una **actividad** que le llega a todos los asesorados del espacio **de una vez**;
- ve el **tablero**: una fila por asesorado, una columna por actividad, y el semáforo en cada cruce.

El tablero ordena primero a quien está **en falta**, después a quien **espera revisión**. Es la misma idea que "Mis asesorados", pero dentro de un espacio y desagregada por consigna.

> [!note] Se arma con dos consultas, no con una por celda
> Los proyectos del área y todos sus hitos se traen de una vez y se cruzan en memoria. Con una consulta por celda, veinte asesorados por seis actividades serían ciento veinte viajes a la base.

> [!important] La leyenda del semáforo está siempre a la vista
> Cada celda es un círculo de color **con su inicial adentro** (`L`, `R`, `O`, `!`, `·`) y el estado completo en el `title`. El color solo nunca alcanza — mismo criterio que `EstadoBadge`.

Verificado end-to-end: dos alumnos dentro reciben las dos actividades; un tercero que entra después las recibe **sin que el asesor haga nada**; al entregar pasa a *Por revisar*, al observarla a *Con observaciones*, y al completarla a *Listo*; reentrar con el mismo código **no duplica**; otro asesor pidiendo el tablero ajeno recibe `403`; y el estudiante nunca ve un código en sus respuestas.

### Tesis grupales y archivos reales

Ver [[Decisiones pendientes#Decisión 15 - Tesis grupales]] y [[Decisiones pendientes#Decisión 16 - Dónde se guardan los archivos de las entregas]].

> [!info] Vinieron del documento, no del código
> Al redactar el [[Entregable 0 - Conceptualización]] aparecieron cinco diferencias entre lo prometido y lo construido. Se decidió **ajustar el sistema al documento**, no al revés. Estas dos eran las de fondo.

**Tesis grupales.** En Proyectos, el estudiante ve una tarjeta *Tesistas* con el grupo y un botón **"Sumar compañero"** que pide el correo. Cualquiera del grupo entrega, se une a un espacio, suma o saca integrantes —y puede irse—, pero **nadie puede dejar la tesis sin nadie**: con un solo integrante la app ni siquiera ofrece el botón.

Para el asesor no cambia nada: una tesis grupal ocupa **una sola ficha** en "Mis asesorados" y **una sola fila** en el tablero, con los nombres juntos. Entregan una vez, así que su avance es uno solo.

**Archivos reales.** El formulario de entrega ahora tiene un selector de archivo; el documento se guarda en PostgreSQL y se descarga con un botón. El campo de enlace externo sigue estando, para quien trabaja en Drive.

> [!note] La descarga va por `fetch`, no por un `<a href>`
> El endpoint está protegido y un enlace directo no puede mandar el token en la cabecera. `client.js` la baja como `blob`, la entrega con un `<a download>` temporal y libera el object URL — si no, el archivo queda en memoria hasta recargar la página.

**Estado de la entrega.** Cada versión tiene su propio veredicto (`En revisión` / `Observada` / `Aprobada`), distinto del estado del hito. Observar una versión la marca sola; aprobar y reabrir los hace el asesor.

Verificado end-to-end: se suma un compañero por correo, el compañero ve la tesis como propia y **entrega él**; el asesor los ve en una sola ficha, descarga el PDF de verdad (`%PDF` intacto, `application/pdf`), lo aprueba y después lo observa; al irse un integrante la tesis queda con uno y desaparece la opción de quitar; y un estudiante ajeno pidiendo el archivo recibe `403`.

### Borrar proyectos

Ver [[Decisiones pendientes#Decisión 17 - Quién puede borrar una tesis, y cómo]].

La tabla de Proyectos tiene una columna **Acciones** con dos botones distintos, porque son dos intenciones distintas:

- **Quitar de mi lista** — solo para el asesor. La tesis sigue entera, deja de estar a su cargo. Reversible: el estudiante se suma a otro espacio con un código.
- **Borrar** — irreversible. Abre un diálogo que enumera qué se destruye, nombra a los tesistas y **pide escribir el título** para habilitar el botón.

> [!important] El rojo aparece recién al pasar por encima
> El botón de borrar es sutil en reposo y se pone rojo en `:hover`. Una tabla con un botón rojo por fila grita todo el tiempo y deja de comunicar; el color tiene que aparecer cuando la acción está por ocurrir.

Verificado end-to-end: quitar de la lista deja la tesis del alumno intacta y sin asesor; borrar con el título equivocado **no habilita** el botón; con el correcto borra la tesis y su historial; un asesor ajeno recibe `403`; y después del borrado quedan **0 filas huérfanas** en hitos, entregas, observaciones, archivos y vínculos.

### Primeros pasos del asesor nuevo

Ver [[Decisiones pendientes#Decisión 14 - Qué hace el sistema cuando un asesor entra por primera vez]] para el porqué.

> [!warning] Corregido el 2026-08-16 — el asesor nuevo entraba a una pared
> Se recorrió el menú completo con una cuenta recién creada: **seis de las ocho pantallas** decían *"Todavía no tenés proyectos asignados. Pasales a tus asesorados el código de tu carpeta"* —una carpeta inexistente— y **ninguna ofrecía una acción**. El camino real solo aparecía en Proyectos y en Mis asesorados.
>
> Es el mismo error que [[#Espacios de trabajo del asesor|el de la carpeta invisible]]: construir para el estado con datos y dejar sin salida a quien recién llega.

El Dashboard ahora abre en `PrimerosPasosAsesor`, que tiene dos estados encadenados:

| Estado | Qué muestra |
|---|---|
| Sin espacio | *"Creá tu espacio de trabajo"* con el campo de nombre y ejemplos (`Taller de Tesis I`, `UPN – Ingeniería`, `Asesorías privadas`) |
| Con espacio, sin asesorados | El código en grande, **"Copiar invitación para enviar"** y un atajo a dejar la primera actividad |

El botón de invitación copia un mensaje completo, no el código solo:

> *Te invito a mi espacio en TesisTrack. Entrá a [dirección], creá tu cuenta como estudiante y usá el código TT-XXXXXX para sumar tu tesis.*

`SinProyecto` pasó de recibir `esEstudiante` (booleano) a `rol`, y **toda variante lleva ahora un botón**. Verificado: las cinco pantallas restantes ofrecen "Ir a mis espacios", el mensaje copiado incluye el código, al volver al panel el texto cambia de *"Creá tu espacio"* a *"Invitá a tus asesorados"*, y cuando un estudiante usa el código el panel pasa solo al dashboard real.

### Asesorías y consultas

Ver [[Decisiones pendientes#Decisión 13 - Quién puede abrir una asesoría]] para el porqué.

Es la otra cadena de trazabilidad y, a la vez, **el canal de dudas del estudiante**. Cualquiera de los dos abre una entrada; los acuerdos van **anidados debajo** de su asesoría, de la más nueva a la más vieja — mismo criterio que Observaciones con las versiones, para no meter un segundo desplegable.

El botón cambia según quién mira: *"Registrar asesoría"* para el asesor, *"Hacer una consulta"* para el estudiante. **Quién la registró va siempre visible**: es lo que distingue una consulta del alumno de una reunión cargada por el asesor.

> [!important] El coordinador sigue sin escribir
> `crear` pasó de `verificarAsesorDelProyecto` a `verificarLectura`, que también deja pasar al coordinador — así que hay un rechazo explícito para su rol. Sin eso, abrir la puerta al estudiante se la habría abierto también a él, contradiciendo la Decisión 8.

### Tareas

Cierra `Asesoría → Acuerdo → Tarea`. El alta ofrece **elegir el acuerdo del que sale** (opcional: también hay tareas sueltas), y como responsable solo al estudiante o al asesor del proyecto.

Las vencidas se destacan en rojo, y la completa **el responsable o el asesor** —el backend ya lo permitía—. El filtro arranca en *Solo pendientes*: es lo que se viene a mirar.

Con esto quedó cerrado el enlace de "Mis asesorados" que apuntaba a `/tareas` y hasta ahora caía en un placeholder.

### Etiquetar y filtrar por área

Ver [[Decisiones pendientes#Decisión 10 - Áreas del asesor]] para el porqué y qué se descartó.

Además de las tarjetas de arriba, en **Proyectos** el asesor tiene una columna **Área** por proyecto para etiquetar y un filtro **"Ver"** con el conteo de tesis por área. El filtro es de pantalla: la API sigue devolviendo todos sus proyectos.

**Endpoints:** `GET/POST /api/areas`, `PUT/DELETE /api/areas/{id}`, `PATCH /api/proyectos/{id}/area` (con `areaId: null` para quitarla). Ver [[API#Áreas (carpetas del asesor)]].

> [!note] Detalles
> - El filtro y la columna solo aparecen para el rol `ASESOR`; el estudiante no ve nada de esto.
> - Los nombres duplicados se rechazan **sin distinguir mayúsculas**: "Ingeniería" e "INGENIERÍA" son la misma área.
> - El filtro solo se muestra si el asesor ya creó al menos un área **y** ya tiene proyectos — no se le ofrece un control vacío.
> - Borrar un área **desetiqueta** sus proyectos, no los borra. Bloquear el borrado por tener tesis adentro sería castigar al asesor por haber usado la función.
> - Cambiar de asesor limpia el área: pertenece al asesor anterior.

### Telón de bienvenida al panel (2026-08-16)

Al entrar al panel, dos hojas cubren la pantalla, una línea dorada se abre desde el centro, aparece el saludo con el nombre y las hojas se separan revelando el panel. Dura ~2,3 s. Vive en `AppLayout`, no en el Dashboard, para que salude al entrar caiga en la pantalla que caiga.

> [!important] Una vez por sesión, no por navegación
> La marca vive en `sessionStorage` y `logout()` la borra. Repetir una animación de dos segundos en cada clic al menú la convierte de linda en molesta.

> [!note] Decisiones de detalle
> - **Con `prefers-reduced-motion` no se muestra**: para quien pidió menos movimiento, la mejor animación es ninguna.
> - `pointer-events: none` en el telón: si algo fallara, la app queda usable debajo.
> - Solo el **nombre de pila**: un nombre completo no entra en una línea y se lee como un trámite.
> - Dice **"Te damos la bienvenida"** y no "Bienvenido": el saludo gendrado erraría con la mitad de los usuarios, y el sistema no guarda el género de nadie (ni debería, por [[Decisiones pendientes#Decisión 9 - Qué datos personales pide el registro|minimización]]).
> - Las dos hojas muestran **tramos distintos de un mismo degradado** (`background-size: 100% 198.02%`). Con un degradado por hoja quedaba una juntura marcada en el medio de la pantalla.

### Pantalla de Observaciones

Primera pantalla pensada desde el **rol del asesor**: es la que cierra el ciclo de corrección de [[Reglas de negocio#El ciclo de corrección, en estados]].

Las observaciones cuelgan de una entrega, no del hito ([[Decisiones pendientes#Decisión 6 - Observaciones y versiones|Decisión 6]]). Se descartó pedir "elegí una entrega" con un tercer desplegable —proyecto → hito → entrega— porque enterraba el trabajo del asesor bajo tres selecciones. En su lugar la pantalla lista **las versiones del hito con sus observaciones debajo**, de la más nueva a la más vieja: el ciclo corregir → reentregar se lee de arriba abajo.

El hito preseleccionado es el que espera revisión: primero el `ENTREGADO`, si no el `OBSERVADO`.

> [!note] Las dos transiciones se ven en vivo
> Registrar una observación devuelve el hito a `OBSERVADO`, y la pantalla recarga los hitos para que el badge no quede viejo — igual que hace Entregas al revés. Resolver una observación **no** toca el estado del hito: eso lo cierra el asesor a mano.

Solo el asesor del proyecto observa y resuelve (`verificarAsesorDelProyecto`). El estudiante ve las observaciones —las necesita para corregir— pero sin botones. El contador de pendientes va arriba, junto al selector.

### Registro en dos pasos

Ver [[Decisiones pendientes#Decisión 9 - Qué datos personales pide el registro]] para el porqué. Acá va cómo quedó implementado.

**Paso 1 — acceso:** correo y contraseña, con **medidor de fuerza** debajo del campo. El botón de Google está a la vista pero deshabilitado, igual que en el login, hasta tener el OAuth Client ID.

> [!note] El medidor informa, no bloquea
> El único requisito duro sigue siendo el mínimo de 8 caracteres del backend. Trabar el registro por una heurística de fuerza empuja a la gente a inventar variantes peores (`Password1!`) en vez de contraseñas realmente buenas.
>
> Criterio de puntaje: **el largo pesa más que la variedad de símbolos**, y una frase de 24+ caracteres sin patrones previsibles llega sola al nivel máximo. Detecta contraseñas del top mundial, secuencias de teclado, caracteres repetidos y el uso del propio correo. Sigue el criterio de accesibilidad de `EstadoBadge`: el nivel se dice con **texto**, el color es refuerzo.
>
> Ojo: `password123`, la clave de los [[#Usuarios de prueba|usuarios de prueba]], puntúa **Débil** con el aviso de que está entre las más usadas. Es correcto — sirve para desarrollo, no para producción.

**Paso 2 — perfil:** nombre, rol (dos tarjetas: Estudiante o Asesor), carrera, universidad u organización, teléfono, ubicación y el checkbox de la política.

Un solo `POST /api/auth/register` con todo al final. Si el correo ya existe, el formulario **devuelve a la persona al paso 1** con el mensaje del backend.

#### Aviso de correo ya registrado (2026-08-16)

Al salir del paso 1 se consulta `GET /api/auth/existe?email=…`. Si el correo ya tiene cuenta, el formulario no avanza y ofrece dos salidas: **Iniciar sesión** y **Recuperar contraseña** (deshabilitado, con la nota de que todavía no existe — igual que en el login).

> [!warning] Revierte una decisión anterior, a conciencia
> La primera versión **descartó** este endpoint por ser un vector de enumeración de correos. Se reconsideró con este argumento: `POST /register` **ya filtraba el dato** al responder "El email ya está registrado", así que consultarlo antes no abre una fuga nueva — solo la abarata.
>
> Mitigación: `LimitadorConsultas` corta en **10 consultas por minuto y por IP** (429). Suficiente para un formulario, inviable para enumerar. Es en memoria y por instancia; si algún día hay varias instancias detrás de un balanceador, hay que moverlo a Redis o al API Gateway.

> [!note] Falla abierto
> Si la consulta falla (backend caído o límite alcanzado), el formulario **deja avanzar**: el `POST /register` valida igual al final. Un problema de red no puede dejar a nadie sin poder crear su cuenta.

#### El email dejó de distinguir mayúsculas (2026-08-16)

Bug latente que salió al construir el aviso de arriba: el email se guardaba y comparaba **tal cual se escribía**. `Ana@utec.pe` y `ana@utec.pe` podían convivir como dos cuentas distintas, y quien se registraba con mayúsculas **no podía entrar** escribiéndolo en minúsculas.

Se normaliza en `User#setEmail` —en la entidad, no solo en el service, para que ningún camino de escritura deje una fila sin normalizar— con `toLowerCase(Locale.ROOT)`: con el locale turco, `I` se convierte en `ı`. Los lookups (`login`, `register`, `existe`, `/me`, `AccesoService`) normalizan la entrada antes de buscar.

`LoginRequest` y `RegisterRequest` recortan el email en el **constructor compacto del record**, porque Bean Validation corre sobre el objeto ya construido: sin eso, un espacio pegado por el autocompletado hacía fallar el `@Email` con "formato incorrecto" en vez de dejar entrar a alguien con la credencial correcta.

**Migración:** se corrió `UPDATE users SET email = lower(btrim(email))` dentro de una transacción que aborta si dos cuentas colapsan en el mismo email al normalizar. En la base local no había colisiones ni filas con mayúsculas (7 usuarios), así que actualizó 0 filas. **Hay que volver a correrla en producción antes de desplegar este cambio.**

```sql
BEGIN;
DO $$
DECLARE colisiones int;
BEGIN
  SELECT count(*) INTO colisiones
  FROM (SELECT lower(btrim(email)) FROM users GROUP BY 1 HAVING count(*) > 1) c;
  IF colisiones > 0 THEN
    RAISE EXCEPTION 'Hay % email(s) que colisionan al normalizar.', colisiones;
  END IF;
END $$;
UPDATE users SET email = lower(btrim(email)) WHERE email <> lower(btrim(email));
COMMIT;
```

**Columnas nuevas en `users`** (todas nullables — `ddl-auto=update` no puede agregar `NOT NULL` sobre filas existentes): `telefono`, `ubicacion`, `carrera`, `organizacion`, `politica_version`, `politica_aceptada_at`.

> [!important] Los datos de perfil no salen en `UserDto`
> Se guardan pero no se difunden. `UserDto` viaja embebido en cada entrega, observación, tarea y asesoría; agregar el teléfono ahí lo publicaría en decenas de respuestas que no lo necesitan.

### Política de privacidad

Página pública en `/privacidad`, fuera de `RutaPublica` para que se pueda leer con sesión abierta y sin ella.

> [!warning] Desde el registro se abre en un modal, no navegando
> La primera versión enlazaba a `/privacidad`. Aunque abría otra pestaña, la página tenía botones de "volver" que devolvían a un **registro vacío**, y el botón atrás del navegador hacía lo mismo: quien iba a leer las políticas perdía todo lo cargado. Se reemplazó por un `<dialog>` modal: sin navegación no hay nada que perder. Se descartó guardar un borrador del formulario en `sessionStorage` porque implicaba persistir la contraseña del paso 1.
>
> El texto vive en `PoliticaContenido.jsx` y lo usan **los dos** —página y modal—, para que nadie acepte un texto distinto del que leyó. El modal se monta con `createPortal` en `<body>`: dentro del formulario heredaba `.auth-card h2` y los títulos salían en serif de 32px, distintos a los de la página.
>
> Abrir la política **no marca** el consentimiento: el botón corta la propagación del clic para que no llegue a la etiqueta del checkbox.

> [!warning] Es un borrador, no está lista para publicar
> Describe con exactitud los datos que se guardan hoy, pero **no fue revisada por un profesional legal** y tiene 7 tramos entre `[corchetes]` que el equipo tiene que completar: razón social, dirección, correo de contacto, proveedor y región de la base, y plazo de eliminación. Están resaltados en la propia página para que salten a la vista.

Si se agrega o se saca un campo del registro hay que actualizar esa página **y** subir `app.politica.version`, porque cada usuario queda asociado a la versión que aceptó.

### Fase 0 - Errores corregidos (2026-10-07)

Primera tanda del cierre del proyecto (rama `fix/fase-0-borrar-espacio-y-estilos`). Cada error se **reprodujo antes** de arreglarlo.

**0.1 — Borrar un espacio con actividades daba "Internal Server Error".** `AreaService#eliminar` desvinculaba los proyectos pero no las actividades, y `actividad.area_id` es `NOT NULL` con FK. Ahora borra en orden (hitos sueltos → actividades → proyectos desvinculados → área) y **ningún hito se borra**: ver la [[Decisiones pendientes#Decisión 18 - Qué se lleva un espacio al borrarse|Decisión 18]].
- El `confirm()` del navegador se reemplazó por `BorrarEspacio`, un diálogo que **pide escribir el nombre** y separa *se pierde* / *no se pierde* con los conteos reales.
- `ApiExceptionHandler` devuelve **409** con mensaje legible ante `DataIntegrityViolationException`; `client.js` nunca muestra un 5xx crudo.
- Verificado: **500 → 204** con la misma prueba; 25 comprobaciones de API y 32 en navegador, incluido borrar una tesis desde la vista del asesor.

**0.2 — Títulos casi invisibles en modo oscuro.** `index.css` es el del template de Vite: `color-scheme: light dark` y un bloque `prefers-color-scheme: dark` que invertía `--text-h`, la variable que usa el `h1/h2` global. Con el sistema en oscuro quedaba blanco sobre tarjeta blanca (**contraste 1.1:1**). Arreglo: `.primeros__titulo` con color explícito, `color-scheme: light` y fuera el bloque oscuro del template.

> [!important] El login y el registro **sí** tienen modo oscuro propio
> Está en `auth.css` con colores explícitos ("la tarjeta mantiene el acabado plateado") y se conservó. No todo lo oscuro era un resto del template.

> [!note] Un barrido de contraste encontró un segundo caso
> No bastaba con mirar los dos títulos del pedido: se midió el contraste de **todo el texto** de cada pantalla en claro y en oscuro. Los fallos exclusivos del modo oscuro pasaron de **2 a 0**; el segundo era el **nombre del estudiante en las tarjetas de "Mis asesorados"**. Queda un resto menor que falla también en claro: el ícono "○" del badge *Pendiente* (2,91:1), que siempre va acompañado de texto.

**0.3 — Puerto de desarrollo.** `vite.config.js` fija `port: 5173` + `strictPort` y un proxy `/api` → `http://localhost:8080`; `.env.development` trae `VITE_API_URL=` vacío. **El `.gitignore` del frontend ignoraba `.env.*`**, así que hubo que exceptuar `.env.development` (no lleva secretos) o no se habría commiteado. Verificado: un segundo `npm run dev` falla con *"Port 5173 is already in use"* en vez de abrir el 5174, y todas las llamadas del navegador salen a `:5173` sin CORS.

### Fase 1 - El espacio como aula (2026-10-07)

Segunda tanda del cierre, en la rama `feat/fase-1-espacio-aula`, **apilada sobre la de la Fase 0** (su PR depende del de la Fase 0). El espacio del asesor deja de ser solo un panel de gestión y pasa a servir como aula, tipo Google Classroom. Las decisiones están en la [[Decisiones pendientes#Decisión 19 - Cómo se organizan los materiales del espacio|19]] y la [[Decisiones pendientes#Decisión 20 - Reuniones con enlace - sesiones del espacio y asesorías programadas|20]]; el esquema, en [[Base de datos#Migración V2 - materiales y reuniones]]; los endpoints, en [[API#Materiales del espacio]].

**1.1 Materiales en carpetas.** Cada espacio nace con *Temas de tesis*, *Rúbrica* y *Clases* (editables y borrables); cada material es un **enlace `https://`** o un **archivo** (`bytea` en tabla aparte, tope de 15 MB, como la Decisión 16). El dueño arma y edita; los estudiantes del espacio solo ven y descargan, y no ven las carpetas vacías. Quitar una carpeta o un material pide confirmar y cuenta cuántos archivos subidos se pierden.

**1.2 Reuniones con enlace.**
- **Sesiones del espacio**: título, fecha y hora, y el enlace que pega el asesor; todos los miembros ven un botón **Unirse**.
- **Asesorías programables**: ganan `estado` (`PROGRAMADA → REALIZADA | CANCELADA`) y `enlace`. El asesor marca realizada y completa el resumen; solo entonces admite acuerdos. El estudiante puede proponer una reunión y cancelar la que abrió.
- **Dashboards** del estudiante y del asesor: tarjeta *Próximas reuniones* con la más cercana destacada y su botón Unirse. Una reunión que empezó hace menos de una hora sigue visible.

**1.3 La vista del espacio.** `EspacioPage` queda con *Código para invitar · Próximas sesiones · Materiales · Tablero · Actividades*. El estudiante entra por **Mi espacio** (nueva entrada del menú) y ve solo sesiones y materiales: ni el código ni el tablero.

**El borrado de espacio se lleva todo lo nuevo.** `AreaService#eliminar` borra también carpetas, materiales, archivos y sesiones, y el diálogo los **lista con números reales** (`GET /areas/{id}/resumen`): *"3 carpetas con 2 materiales, de los cuales 1 archivo subido (no se pueden recuperar)"*, *"2 sesiones con su enlace"*.

**Contraste.** Se corrigió el ícono "○" del badge *Pendiente* (2,91:1 → ≥ 4,5:1) y, de paso, el "✓" de *Completado/Realizada* (3,00:1), que el nuevo badge de asesoría reutilizaba. El barrido de todas las pantallas en claro y oscuro quedó en **0 textos bajo 3:1**.

> [!success] Verificado el 2026-10-07
> - **Migración** por los tres caminos: base vacía, base sin historial de Flyway con el esquema de `V1`, y base con `V1` en su historial (la que levanta `docker compose`), esta última con datos reales preservados.
> - **API**: 135 comprobaciones nuevas (permisos de cada rol, validaciones, descarga con bytes idénticos, tope de 15 MB, ciclo de la asesoría, próximas reuniones, borrado con 0 filas huérfanas) y las 130 de las fases anteriores, sin regresiones.
> - **Navegador** con 1 asesor y 3 estudiantes (uno solo y dos en grupo): 62 comprobaciones — subir y bajar un archivo, enlaces que abren en pestaña nueva, el compañero de un grupo que ve pero no cancela lo que no abrió, el ciclo completo de una asesoría y el borrado del espacio.

### Fase 1.5 - Clases y vistas (2026-10-07)

Rama `feat/fase-1-5-clases-y-vistas`, con PR sobre `feat/fase-1-espacio-aula`: depende del **#8** y transitivamente del **#6**. La implementación queda lista para revisión de Alonso; **Fase 2 detenida hasta el OK de Oscar**.

- Vocabulario único: Clase, Grupo/Mi tesis y carpetas solo para materiales; compatibilidad de rutas antiguas mediante redirecciones.
- Clase con cinco pestañas para el profesor y tres para el estudiante. Avisos simples, Personas con privacidad por grupo, quitar grupo preservando su tesis y Configuración con confirmaciones.
- Dashboard agregado y semáforo por grupo; revisiones antiguas primero y enlaces a tesis/hito.
- Preferencia privada persistida y editable desde perfil, selector de profesores filtrado y lista privada solo de tesis sin clase (ajuste D11).
- Vista previa autenticada de PNG/JPEG/GIF/WebP/PDF desde blob y revocación al cerrar. SVG/HTML/Office solo descarga; MIME verificado también para archivos legacy mediante V3.
- Se corrigieron dos textos residuales con “proyecto” y el contraste de texto secundario e iconos de estado. Política `app.politica.version=2026-10-07`; enlaces de entrega https.

> [!success] Verificado el 2026-10-07 en infraestructura descartable
> - **371 comprobaciones API**: smoke 70, smoke2 35, Fase 0 25, Fase 1 135, Fase 1.5 106.
> - **163 comprobaciones de navegador Edge**: Fase 1.5 101 y regresión Fase 1 62. Profesor, estudiantes individual/grupal, profesor ajeno, sin privadas y coordinador; vocabulario visible, aislamiento, descargas idénticas, revocación de blobs y consola.
> - **52 comprobaciones de V3 sobre filas legacy**; los MIME falsos se corrigen sin alterar bytes. V1/V2/V3 no se reescribieron.
> - Barrido de contraste de pantallas nuevas en preferencias claras y oscuras: **0 incidencias** con umbrales 4,5:1 para texto normal y 3:1 para texto grande, excluyendo controles deshabilitados. Es un barrido de colores sólidos, no una certificación completa de accesibilidad.
> - `mvnw.cmd -B test`: contextLoads aprobado, Flyway valida tres migraciones y Hibernate valida esquema. `npm run build`: aprobado. Lint: 0 errores, los 4 avisos previos de Fast Refresh.

**Adaptaciones de las pruebas anteriores:** /asesorados ahora excluye tesis de clase y los bytes aleatorios declarados como PDF son octet-stream. La regresión UI conserva sus operaciones pero navega las pestañas nuevas; las esperas se hacen sobre el contenido apropiado. Los fallos de pruebas por mayúsculas CSS, radios controlados y el segundo privado resultante de borrar una clase quedaron corregidos sin alterar esas reglas del producto.

**Evidencia local:** scripts y logs `cierre-*.log` en el scratchpad de la sesión (fuera del repo), más capturas `f15-*.png`. Son pruebas locales; convertirlas en suites versionadas y un job de CI sigue siendo deuda. El Docker de :3000 con datos reales no se reinició ni modificó para esta fase. Solo se usaron :5173, :8080 y tesistrack-smoke-db en :5433.

**Interpretaciones para confirmar con Oscar:** avisos como texto simple; quitar por grupo; privado = tesis sin clase; profesores elegibles por nombre solo si ofrecen privadas; endurecimiento https en entregas; nueva versión de política. **Pregunta abierta:** código personal para privadas. *Tema por definir* queda preparado visualmente para Fase 2, sin implementar el asistente ni el tope de integrantes.

Ver [[Decisiones pendientes#Decisión 21 - Unificar el vocabulario de la interfaz]], [[API#Perfil y asesorías privadas]] y [[Base de datos#Migración V3 - clases, avisos y archivos verificados]].

### Fase 1.6 - Rediseño visual (2026-10-07)

Rama `feat/fase-1-6-rediseno`, con PR sobre `feat/fase-1-5-clases-y-vistas`: depende del **#9** y, transitivamente, del #8 y el #6. Aplica la guía visual aprobada por Oscar ([[Decisiones pendientes#Decisión 27 - Adoptar la guía visual sin tocar el login|D27]]) y el semáforo nuevo ([[Decisiones pendientes#Decisión 26 - Semáforo del grupo - En riesgo en vez de Por atender|D26]]). **La Fase 2 sigue detenida hasta el OK de Oscar**; los asistentes de primer ingreso (maquetas 06 y 07) son parte de ella.

- **Backend:** `SemaforoGrupo` con la regla de riesgo por plazo, más su primer test unitario real (`SemaforoGrupoTest`, 7 casos). El Dashboard del profesor suma código y próxima sesión por clase, la entrega con su tipo verificado y los motivos de *Necesitan atención*. El de la tesis suma su `semaforo`, y `ObservacionDto` suma el hito. Sin migración: no cambia el esquema.
- **Frontend:** tokens en `:root`, `Icono.jsx` (SVG de línea), migas de pan (`useMigas`), `RepartoSemaforo`, `ChipCodigo`, `Seccion` y `Vacio` con ícono. Se rehicieron el layout, los Dashboards, Mis clases, la clase completa, el visor y la matriz de Seguimiento. Se borró `ProgressRing`, el anillo de "0% de hitos".
- **Bugs que aparecieron en el camino:**
  - Las fechas límite se mostraban **un día antes**: `new Date('2026-10-03')` es medianoche UTC, que en Lima es el día anterior. `fecha()` ahora lee las fechas sin hora como día local.
  - En Tareas, después de las 19:00 de Lima una tarea que vencía hoy aparecía vencida, porque `toISOString()` ya daba la fecha de mañana.
  - En celular, el selector de grupo de Entregas estiraba la página a 754 px.
  - Un texto daba por hecho el género del profesor ("él lo deja").

> [!success] Verificado el 2026-10-07 en infraestructura descartable (:5173, :8080, `tesistrack-smoke-db` en :5433)
> - **Fase 1.6: 76 comprobaciones** (API y Edge): las cuatro reglas del semáforo, incluido el riesgo por plazo a 2 y a 5 días; orden y motivos de *Necesitan atención*; aislamiento entre profesores; privacidad de Personas.
>   - En el visor: observar (pide texto y actualiza el Dashboard y el contador del menú) y aprobar; zoom con topes.
>   - Buscador de clases por nombre y por código; migas; fechas sin corrimiento; leyenda fija.
>   - Dashboard del estudiante con su semáforo, el próximo hito y las observaciones con enlace a su hito.
>   - Sin scroll horizontal a 390 px en 6 pantallas. Contraste AA en panel, barra lateral, visor y diálogos: 0 incidencias.
> - **Regresión: 371 API + 163 navegador**: smoke 70, smoke2 35, Fase 0 21, Fase 1 135, Fase 1.5 106; navegador Fase 1 62 y Fase 1.5 101. El crawl de vocabulario sigue sin "espacio", "área" ni "proyecto".
> - **Login, registro (con el modal de la política), landing y privacidad**, en claro y oscuro: **idénticos píxel a píxel** antes y después.
> - `mvnw.cmd -B test`: 8/8 (contextLoads y SemaforoGrupoTest). Build aprobado. Lint con los 4 avisos previos.

**Adaptaciones de las pruebas anteriores:** las que fijaban la regla vieja del amarillo ("entregó → amarillo") pasan a esperar "al día". Los selectores siguen el markup nuevo: portada de la clase, cronología, "Evaluar" en vez de "Revisar" y "Próximas reuniones" como sección. Ninguna regla de permisos cambió.

**Para confirmar con Oscar:** el umbral de riesgo de **3 días**. Qué quedó afuera por falta de datos: ciclo lectivo, descripción de la clase, notas ancladas a una página del PDF y adjuntos en avisos.

**Entregable 4 — CI/CD y despliegue** 🔨 (empezado el 2026-10-03 por Alonso, PRs #2 a #5)
- [x] Dockerfile del backend (multi-stage, Java 17, usuario sin privilegios) y del frontend (Node 22 → nginx con proxy `/api`)
- [x] `docker-compose.yml` con el stack completo — verificado el 2026-10-07: los 3 contenedores levantan, Flyway aplica `V1` y el login y el registro andan en el navegador
- [x] GitHub Actions: `imagen-backend.yml` e `imagen-frontend.yml` construyen y **publican las imágenes en ghcr.io** al pushear a `main` (corridas del 2026-10-03 en verde)
- [ ] **CI que corra tests**: las imágenes se construyen con `-DskipTests` y el único test del repo es `contextLoads`
- [ ] Backend en AWS, frontend en Vercel (con root directory en las subcarpetas) — no empezado
- [ ] `JWT_SECRET` real por variable de entorno en producción: el compose trae uno de desarrollo a la vista

**Fuera de alcance por ahora**
- [ ] Login con Google — pendiente del OAuth Client ID
- [ ] Recuperación de contraseña — el botón está en la UI pero deshabilitado

## Cosas que conviene recordar

- **El logo** va en `tesistrack-web/public/marca/` (`logo.png` y `logo-blanco.png`). Hay un `LEEME.md` ahí con las instrucciones.
- **Los badges de estado llevan siempre ícono + texto.** No es capricho: `OBSERVADO` y `COMPLETADO` son casi indistinguibles en deuteranopía. Ver [[Arquitectura#Color de los estados]].
- **React va fijado en 18.3.1 exacto**, sin `^` ni `~`, igual que React Router. No lo actualices al agregar dependencias.

## Ver también
- [[Arquitectura]]
- [[Base de datos]]
- [[API]]
- [[Entregables y evaluación]]
