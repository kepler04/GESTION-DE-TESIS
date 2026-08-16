---
title: Desarrollo
tags:
  - desarrollo
---

# Desarrollo

> [!success] Entregables 1 y 2 cerrados; el 3 en curso
> Las [[Decisiones pendientes]] están resueltas (8 de alcance + la 9, 10 y 11 que salieron durante el desarrollo), así que no hay nada bloqueando. El modelo de datos y la API están terminados y verificados; del panel faltan **Asesorías + Acuerdos** y **Tareas**.

> [!warning] Antes de construir algo nuevo, leer [[Auditoría de requisitos]]
> Contrasta lo construido contra el enunciado del curso. Varias funcionalidades de [[Funcionalidades]] siguen sin interfaz mientras se construyeron cosas que el enunciado no pide.

> [!important] Al 2026-08-16 nada de esto está commiteado
> Todo el trabajo del Entregable 3 vive en el working tree. Antes de commitear, sincronizar el vault:
> `robocopy "E:\GENERAL\TesisTrack" "e:\CLAUDE\UTEC\TesisTrack" /MIR`

## Repositorio

**Monorepo** → https://github.com/kepler04/GESTION-DE-TESIS

| Carpeta | Qué es |
|---|---|
| `tesistrack-app/` | Backend — Spring Boot 4, API REST, PostgreSQL |
| `tesistrack-web/` | Frontend — React 18.3.1 + Vite |
| `TesisTrack/` | Copia versionada de este vault |

> [!warning] El vault se edita en `E:\GENERAL\TesisTrack`
> La carpeta `TesisTrack/` del repo es una **copia**. Se sincroniza antes de commitear con
> `robocopy "E:\GENERAL\TesisTrack" "e:\CLAUDE\UTEC\TesisTrack" /MIR`.
> Si editás la copia directamente, el próximo sync la pisa.

En `e:\CLAUDE\UTEC\CLAUDE.md` está el contexto que se carga al trabajar con Claude Code. Ver el stack y el porqué de cada decisión en [[Arquitectura]].

## Cómo levantar el proyecto

```
# Base de datos (desde tesistrack-app)
docker compose up -d          # PostgreSQL en :5432

# Backend (desde tesistrack-app) → :8080
./mvnw.cmd spring-boot:run

# Frontend (desde tesistrack-web) → :5173
npm run dev
```

> [!important] El frontend tiene que quedar en el puerto 5173
> El backend solo acepta CORS desde `http://localhost:5173` (`cors.allowed-origins`). Si Vite avisa "Port 5173 is in use" y salta a otro puerto, el login falla por CORS: matá el proceso viejo en vez de dejarlo cambiar de puerto.

### Usuarios de prueba

Cargados a mano en la base local, no vienen con el repo.

| Rol | Email | Contraseña |
|---|---|---|
| Estudiante | `prueba@tesistrack.com` | `password123` |
| Asesor | `asesor@tesistrack.com` | `password123` |

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
- [ ] Subida real de archivos — falta decidir S3 vs. filesystem, ver [[Arquitectura#Por definir]]
- [ ] Resolver el menú del coordinador, que contradice la [[Decisiones pendientes|Decisión 8]] (ver más abajo)

> [!success] Las funcionalidades de [[Funcionalidades]] están completas
> Con Asesorías y Tareas ya no queda ninguna pantalla en `PendientePage` —el componente se borró—. La única funcionalidad listada que falta es **"Subir documento"**, que espera la decisión de almacenamiento.

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

**Entregable 4 — CI/CD y despliegue** ⬜
- [ ] Pipeline de GitHub Actions
- [ ] Backend en AWS, frontend en Vercel (con root directory en las subcarpetas)
- [ ] `JWT_SECRET` real por variable de entorno en producción

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
