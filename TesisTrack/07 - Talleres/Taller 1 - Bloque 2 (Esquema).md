---
title: Taller 1 - Bloque 2 (Esquema)
tags:
  - taller
  - diseño
  - sql
aliases:
  - Bloque 2 Taller UTEC
  - CREATE TABLE TesisTrack
---

# Taller 1 — Bloque 2: Construcción del esquema

> [!info] Contexto
> Parte de [[Taller 1 - Enunciado]]. Traduce a PostgreSQL el modelo de [[Taller 1 - Bloque 1 (Diseño)]] — 8 tablas, 8 PK, 14 FK.

> [!abstract] Qué pide el bloque
> Traducir el ERD a `CREATE TABLE`, definir tipos y constraints (`PK`, `FK`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`), incluir al menos un valor automático con `DEFAULT`, y configurar `ON UPDATE`/`ON DELETE` **justificando las decisiones principales**.

> [!success] Verificado contra PostgreSQL 16.14 el 2026-08-20
> El script corrió sin errores. Estructura real en la base, contada con `pg_constraint`:
> **8 tablas · 8 PK · 14 FK · 5 UNIQUE · 19 CHECK · 13 índices + 1 índice único parcial.**
>
> El `ON DELETE SET NULL (reunion_id)` de la FK compuesta —lo único que exigía PostgreSQL 15+— fue aceptado sin problema.

## 1. Decisiones de tipo

### `INTEGER GENERATED ALWAYS AS IDENTITY`, no `SERIAL`

`SERIAL` es una abreviatura heredada: crea una secuencia por detrás que queda como objeto suelto, no es SQL estándar, y permite insertar el `id` a mano y desincronizar el contador. `IDENTITY` es el estándar desde SQL:2003 y PostgreSQL lo soporta desde la versión 10 — la secuencia queda ligada a la columna y `ALWAYS` bloquea que alguien escriba el `id` por su cuenta.

`INTEGER` y no `BIGINT` porque el tope de `INTEGER` son 2 147 483 647 filas: para una plataforma de seguimiento de tesis sobra por varias vidas.

### `TIMESTAMPTZ`, no `TIMESTAMP`

`TIMESTAMP` sin zona guarda un número que **no significa nada sin saber dónde se generó**. En una plataforma general (ver [[Alcance]]) un asesor puede estar en otro huso que el estudiante. `TIMESTAMPTZ` normaliza a UTC al guardar y convierte al leer.

### `VARCHAR` + `CHECK`, no `ENUM` nativo

Ya justificado en el Bloque 1: agregar un valor a un `CREATE TYPE` requiere `ALTER TYPE`, y quitarlo es casi imposible sin recrear el tipo y todas las columnas que lo usan. Los estados de este proyecto ya cambiaron una vez durante el diseño. Un `CHECK` se modifica con un `DROP CONSTRAINT` y un `ADD CONSTRAINT`.

## 2. Acciones referenciales — dos reglas, no catorce decisiones

El criterio no se toma FK por FK, sino según **qué representa** la relación:

| Naturaleza de la relación | Acción | Por qué |
|---|---|---|
| **Composición** — el hijo no existe sin el padre (`proyecto`→`hito`, `hito`→`entrega`, `entrega`→`observacion`, `proyecto`→`reunion`/`tarea`/`participacion`) | `ON DELETE CASCADE` | Borrar el proyecto y dejar hitos huérfanos no tiene sentido: son partes del mismo objeto |
| **Autoría** — el `usuario` que generó el registro (`registrado_por`, `subido_por`, `revisado_por`, `autor_id`, `responsable_id`, `participacion.usuario_id`) | `ON DELETE RESTRICT` | Un sistema cuyo propósito es la trazabilidad **no puede perder** al autor de una observación. No se borra a una persona: se marca `activo = FALSE` |

**Dos excepciones**, ambas deliberadas:

| FK | Acción | Por qué |
|---|---|---|
| `observacion.resuelta_por_entrega_id` | `ON DELETE SET NULL` | Es un vínculo *opcional*: si se borra la entrega que corrigió la observación, la observación **sigue siendo cierta**. Con `CASCADE` se borraría un comentario del asesor por eliminar otra cosa |
| `tarea.(reunion_id, proyecto_id)` | `ON DELETE SET NULL (reunion_id)` | La tarea es un compromiso real; si se borra la reunión de origen, el compromiso sobrevive y solo pierde el dato de dónde nació |

> [!note] `ON UPDATE NO ACTION` en las 14 FK
> Es el default de PostgreSQL, pero se declara explícito. Todas las PK son `IDENTITY` autogeneradas y **nunca se actualizan**, así que no hay nada que propagar. Declararlo evita que alguien asuma que se dejó al azar.

## 3. Las dos restricciones que no son obvias

### El índice único parcial — un solo asesor por proyecto

```sql
CREATE UNIQUE INDEX uq_un_asesor_por_proyecto
    ON participacion (proyecto_id)
    WHERE rol_en_proyecto = 'asesor' AND fecha_baja IS NULL;
```

`UNIQUE (proyecto_id, usuario_id)` impide repetir **personas**, no repetir **roles**: sin este índice nada frena que un proyecto tenga tres asesores. La cláusula `WHERE` es lo que lo hace posible — el índice solo cubre las filas de asesores activos, así que sí puede haber varios estudiantes y un coasesor, y un asesor dado de baja no bloquea al nuevo.

Es una construcción propia de PostgreSQL: en MySQL habría que resolverlo con un trigger.

### La FK compuesta — la tarea y su reunión, del mismo proyecto

```sql
-- en reunion
CONSTRAINT uq_reunion_proyecto UNIQUE (id, proyecto_id),

-- en tarea
CONSTRAINT fk_tarea_reunion FOREIGN KEY (reunion_id, proyecto_id)
    REFERENCES reunion (id, proyecto_id)
    ON DELETE SET NULL (reunion_id) ON UPDATE NO ACTION
```

`tarea` guarda su propio `proyecto_id` (decisión del Bloque 1). Eso abre la puerta a una incoherencia: una tarea del proyecto A apuntando a una reunión del proyecto B. La FK compuesta la cierra **en la base**, no en el backend.

Dos detalles que la hacen funcionar:

- **`MATCH SIMPLE`** (el default): si `reunion_id` es `NULL`, la FK no se verifica. Justo lo que hace falta para las tareas sueltas, que no nacen de ninguna reunión.
- **`ON DELETE SET NULL (reunion_id)`** — la lista de columnas es un agregado de **PostgreSQL 15**. Sin ella, `SET NULL` anularía también `proyecto_id`, que es `NOT NULL`, y el borrado fallaría.

> [!warning] Si el motor es anterior a PostgreSQL 15
> Reemplazar la FK compuesta por una simple —`FOREIGN KEY (reunion_id) REFERENCES reunion (id) ON DELETE SET NULL`— y validar la coherencia proyecto-reunión en el backend. Se pierde la garantía en la base, pero el resto del esquema no cambia.

## 4. Los `DEFAULT`

El bloque pide *"al menos un valor automático"*; el esquema tiene nueve.

| Tabla | Columna | Valor | Para qué |
|---|---|---|---|
| `usuario` | `activo` | `TRUE` | Nace habilitado |
| `usuario` | `creado_en` | `now()` | Marca de alta |
| `proyecto` | `estado` | `'en_curso'` | Un proyecto se crea en curso |
| `proyecto` | `fecha_inicio` | `CURRENT_DATE` | Arranca el día que se crea salvo que se indique otra |
| `proyecto` | `creado_en` | `now()` | Auditoría |
| `participacion` | `fecha_asignacion` | `CURRENT_DATE` | Se asigna hoy |
| `hito` | `estado` | `'pendiente'` | Todo hito nace sin empezar |
| `hito`, `tarea` | `creado_en` | `now()` | Auditoría |
| `tarea` | `estado` | `'pendiente'` | — |
| `entrega` | `estado`, `fecha_entrega` | `'enviada'`, `now()` | La entrega se sube y queda a la espera |
| `observacion` | `estado`, `fecha` | `'pendiente'`, `now()` | La observación nace sin atender |

> [!note] `now()` vs `CURRENT_DATE`
> `now()` devuelve `TIMESTAMPTZ` (instante exacto); `CURRENT_DATE` devuelve `DATE`. Se usa cada uno según el tipo de la columna — mezclarlos obliga a un casteo implícito.

## 5. Los `CHECK` — más allá de los dominios

Los obvios validan los dominios de estado. Los interesantes son los que **impiden estados incoherentes**:

| Constraint | Qué impide |
|---|---|
| `ck_tarea_completado` | Una tarea `completada` sin `fecha_completado`, o una `pendiente` que ya tiene fecha de cierre |
| `ck_entrega_revision` | Que haya `revisado_por` sin `fecha_revision` o al revés — los dos datos de la revisión van juntos o no van |
| `ck_observacion_resolucion` | Una observación `pendiente` que ya tiene datos de resolución cargados |
| `ck_observacion_no_autocorreccion` | Que una entrega figure corrigiendo la observación que ella misma generó |
| `ck_proyecto_fechas` | Una fecha de fin estimada anterior al inicio |
| `ck_participacion_baja` | Una baja anterior a la asignación |
| `ck_usuario_correo_formato` | Un correo sin `@` ni dominio |
| `ck_hito_orden`, `ck_entrega_version` | Órdenes o versiones en cero o negativas |

El patrón de los tres primeros es el mismo: **columnas que solo tienen sentido juntas**. El `CHECK` es lo que convierte esa regla de negocio en algo que la base garantiza.

## 6. Índices

PostgreSQL indexa la PK y cada `UNIQUE` por su cuenta. **Las FK no se indexan solas** —a diferencia de MySQL/InnoDB—, así que sin índices explícitos cada `JOIN` recorre la tabla entera.

**Siete índices sobre FK** que ningún `UNIQUE` deja cubiertas: `participacion(usuario_id)`, `reunion(registrado_por)`, `tarea(reunion_id)`, `entrega(subido_por)`, `entrega(revisado_por)`, `observacion(autor_id)`, `observacion(resuelta_por_entrega_id)`.

**Seis índices compuestos** para las consultas del panel:

| Índice | Consulta que acelera |
|---|---|
| `hito (proyecto_id, fecha_limite)` | Próximos hitos del proyecto, ordenados |
| `reunion (proyecto_id, fecha DESC)` | Historial de asesorías, la más reciente primero |
| `tarea (proyecto_id, estado)` | Tareas pendientes del proyecto |
| `tarea (responsable_id, estado)` | Mis pendientes al iniciar sesión |
| `entrega (hito_id, version DESC)` | La última versión sin escanear todas |
| `observacion (entrega_id, estado)` | Contar observaciones sin atender |

> [!tip] Por qué `proyecto_id` no necesita índice propio en `hito` ni `entrega`
> `uq_hito_orden (proyecto_id, orden)` y `uq_entrega_version (hito_id, version)` ya arrancan con esa columna, y un índice compuesto sirve para las consultas que filtran por su **prefijo izquierdo**. Un índice extra sobre `proyecto_id` solo sería peso muerto en cada `INSERT`.

## 7. El script

El archivo completo está en `02_esquema.sql`, en la raíz del repo del taller. Estructura:

1. `DROP TABLE IF EXISTS ... CASCADE` — para poder recorrer el script las veces que haga falta.
2. Las 8 tablas, en orden de dependencia: `usuario` → `proyecto` → `participacion` → `hito` → `reunion` → `tarea` → `entrega` → `observacion`.
3. El índice único parcial, junto a `participacion`.
4. Los 13 índices, al final.

## 8. Notas para sustentar

**¿Por qué `CASCADE` en unas FK y `RESTRICT` en otras?**
Porque responden a preguntas distintas. `CASCADE` es para composición: el hito es *parte del* proyecto, borrar el proyecto sin sus hitos deja basura. `RESTRICT` es para autoría: la observación no es *parte de* su autor, solo lo referencia — y borrar a la persona destruiría la trazabilidad que el sistema existe para dar.

**¿Por qué `observacion` tiene dos FK a `entrega` con acciones distintas?**
Porque significan cosas distintas. `entrega_id` es el origen: sin esa entrega la observación no existe → `CASCADE`. `resuelta_por_entrega_id` es la corrección: es un dato *añadido después*, y si desaparece la observación sigue siendo válida → `SET NULL`.

**¿No sería más simple validar todo en el backend?**
El backend valida, pero no es la única puerta a la base: hay migraciones, cargas masivas y consultas manuales. Lo que garantiza la base se cumple siempre; lo que garantiza la aplicación se cumple solo cuando se pasa por la aplicación.

## Ver también
- [[Taller 1 - Enunciado]]
- [[Taller 1 - Bloque 1 (Diseño)]]
- [[Reglas de negocio]]
