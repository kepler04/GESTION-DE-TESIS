---
title: Taller 1 - Bloque 4 (Consultas)
tags:
  - taller
  - sql
aliases:
  - Bloque 4 Taller UTEC
  - Consultas de negocio TesisTrack
---

# Taller 1 — Bloque 4: Consultas

> [!info] Contexto
> Parte de [[Taller 1 - Enunciado]]. Corre sobre los datos de [[Taller 1 - Bloque 3 (Carga y manipulación)]]. El script completo es `04_consultas.sql`.

> [!abstract] Qué pide el bloque
> Responder preguntas de negocio con `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`. Resolver 2-3 preguntas de negocio. Incluir una consulta con `INNER JOIN`, una con `JOIN` múltiple y una con `LEFT JOIN` para identificar registros sin relación. Generar reportes con `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`.

> [!success] Verificado contra PostgreSQL 16.14 el 2026-08-20
> Las 13 consultas corrieron sin errores y devolvieron filas coherentes. Resultados destacados:
>
> - **A2** devolvió la entrega sin revisar de Patricia: `prototipo_v1.pdf`, 6 días esperando.
> - **A3** encontró el proyecto sin asesor: *Deserción estudiantil*, 141 días sin asignación.
> - **B1** mostró los tres proyectos con 50 % · 33,3 % · sin hitos — el `NULLIF` evitó la división por cero en el tercero, tal como se diseñó.
> - **B3** devolvió un solo hito atrasado, y *Metodología* correctamente **ausente**: el `UPDATE` del Bloque 3 lo reprogramó y el dato derivado se actualizó solo.
> - **C1** devolvió las cuatro observaciones; la abierta del proyecto 2 sale con `corregida_en` en `NULL` — es la fila que **prueba para qué está el `LEFT JOIN`**.
> - **D1** dio 1 fila esperada y cuatro ceros.

## Cobertura del enunciado

| Requisito | Dónde |
|---|---|
| `SELECT` + `WHERE` + `ORDER BY` + `LIMIT` | A1 |
| `INNER JOIN` | A1 |
| `JOIN` múltiple | A2 — seis tablas encadenadas |
| `LEFT JOIN` para registros sin relación | A3 |
| `COUNT` | B1, B3, B4, B5, D1 |
| `SUM` | B4 |
| `AVG` | B2 |
| `MAX` / `MIN` | B2, B4 |
| Consulta de validación | D1 |

---

## A. Las tres preguntas de negocio

Una por cada rol del sistema — son las tres pantallas que [[Alcance]] define como razón de ser de TesisTrack.

### A1 — Estudiante: *"¿Qué tengo pendiente y para cuándo?"*

```sql
SELECT t.descripcion, p.titulo AS proyecto, t.fecha_limite,
       t.fecha_limite - CURRENT_DATE AS dias_restantes
FROM tarea t
INNER JOIN proyecto p ON p.id = t.proyecto_id
INNER JOIN usuario  u ON u.id = t.responsable_id
WHERE u.correo = 'diego.ramirez@tesistrack.com'
  AND t.estado = 'pendiente'
ORDER BY t.fecha_limite ASC
LIMIT 5;
```

Es el widget "Mis pendientes" del panel. Un `dias_restantes` negativo significa que ya venció.

> [!tip] Acá se cobra la decisión del Bloque 1 sobre `tarea`
> Como `tarea` guarda su propio `proyecto_id`, la consulta llega al proyecto con **un solo `JOIN`**. Si la tarea colgara únicamente de `reunion` harían falta dos saltos — y las tareas sueltas, sin reunión, no aparecerían nunca.

### A2 — Asesor: *"¿Qué entregas esperan mi revisión?"* — `JOIN` múltiple

Seis tablas encadenadas: `entrega → hito → proyecto → participacion → usuario`, más el usuario que subió el archivo.

```sql
WHERE ase.correo         = 'patricia.nunez@tesistrack.com'
  AND pa.rol_en_proyecto = 'asesor'
  AND pa.fecha_baja IS NULL      -- solo los proyectos que asesora HOY
  AND e.estado           = 'enviada'
```

La condición `pa.fecha_baja IS NULL` es la que impide que un asesor saliente siga viendo la bandeja de un proyecto que ya no lleva.

### A3 — Coordinador: *"¿Qué proyectos siguen sin asesor?"* — `LEFT JOIN`

```sql
FROM proyecto p
LEFT JOIN participacion pa
       ON pa.proyecto_id     = p.id
      AND pa.rol_en_proyecto = 'asesor'
      AND pa.fecha_baja IS NULL
WHERE pa.id IS NULL
```

> [!warning] El error que casi todos cometen acá
> Las tres condiciones del asesor van en el **`ON`**, no en el `WHERE`. Si estuvieran en el `WHERE`, las filas sin coincidencia —que llegan con `NULL` en todas las columnas de `participacion`— se filtrarían, y el `LEFT JOIN` se comportaría como un `INNER JOIN`. Se perderían justo los proyectos que se quieren encontrar.

---

## B. Reportes con agregación

### B1 — Panel del coordinador: avance por proyecto

`COUNT` con `FILTER`, sobre tres `LEFT JOIN` encadenados. Dos detalles evitan errores clásicos:

| Detalle | Por qué |
|---|---|
| `count(DISTINCT h.id)` | El encadenado de `LEFT JOIN` multiplica filas: un hito con 3 entregas aparecería 3 veces y se contaría 3 veces |
| `NULLIF(count(...), 0)` | Evita la división por cero en el proyecto sin hitos. Sin él la consulta revienta justo en el caso que interesa mostrar |

### B2 — Desempeño de revisión por asesor — `MIN`, `MAX`, `AVG`

```sql
min(e.fecha_revision - e.fecha_entrega) AS revision_mas_rapida,
max(e.fecha_revision - e.fecha_entrega) AS revision_mas_lenta,
avg(e.fecha_revision - e.fecha_entrega) AS demora_promedio
```

Restar dos `TIMESTAMPTZ` da un `INTERVAL`, y `avg()` sobre intervalos funciona directo en PostgreSQL — no hace falta convertir a segundos y volver.

> [!note] Esta consulta solo existe porque el modelo se corrigió
> `revisado_por` y `fecha_revision` fueron dos de los huecos detectados al revisar el Bloque 1. Sin esas columnas no habría forma de medir cuánto tarda un asesor en revisar.

### B3 — Hitos atrasados: el estado `vencido` que **no** se almacena

```sql
WHERE h.fecha_limite < CURRENT_DATE
  AND h.estado <> 'completado'
```

Es la justificación práctica de la decisión del Bloque 1. El hito *Metodología* **no aparece** en el resultado porque el `UPDATE (e)` del Bloque 3 lo reprogramó: el dato derivado se actualizó solo, sin job nocturno ni fila desactualizada.

### B4 — Atraso acumulado — `COUNT` + `SUM` + `MAX`

### B5 — Carga de trabajo por asesor

Ricardo no aparece: quedó inactivo y con `fecha_baja`. Jorge sí, y se ve que lleva un proyecto como asesor y otro como coasesor.

---

## C. Trazabilidad — lo que justifica el modelo

### C1 — La cadena completa: qué se observó y qué versión lo corrigió

```sql
INNER JOIN entrega origen     ON origen.id     = o.entrega_id
LEFT  JOIN entrega correccion ON correccion.id = o.resuelta_por_entrega_id
```

> [!important] Es **la** consulta a mostrar en la sustentación
> Ninguna versión anterior del modelo podía responderla. Las dos FK de `observacion` hacia `entrega` —origen y corrección— permiten unir la misma tabla dos veces con significados distintos, y reconstruir en una sola fila: *qué versión se observó, qué dijo el asesor, qué versión lo corrigió y cuánto tardó*.
>
> El `LEFT JOIN` en la segunda es obligatorio: una observación pendiente todavía no tiene entrega correctora.

### C2 — Historial cronológico sin tabla `historial`

`UNION ALL` sobre `reunion`, `entrega` y `observacion`, ordenado por fecha. El Bloque 1 decidió no crear una tabla `historial` porque la línea de tiempo es derivable; esta consulta es la prueba.

### C3 — Ficha de un proyecto: quién es quién

Muestra el cambio de asesor —Ricardo con fecha de baja, Patricia activa—. Es la razón por la que el índice único parcial lleva `AND fecha_baja IS NULL`: sin esa cláusula este historial sería imposible de representar.

---

## D. Validación de los datos cargados

### D1 — Chequeos de coherencia que la base no garantiza sola

| Verificación | Esperado |
|---|---|
| Proyectos sin asesor activo | **1** — es el caso cargado a propósito para A3 |
| Hitos completados sin entrega aprobada | 0 |
| Observaciones atendidas sin entrega correctora | 0 |
| Hitos con versiones no correlativas | 0 |
| Usuarios sin ningún proyecto | 0 |

La primera fila no es un error. Las otras cuatro **deben dar 0**: si alguna no lo hace hay una incoherencia lógica que los `CHECK` del Bloque 2 no pueden detectar, porque cruzan varias tablas y un `CHECK` solo ve su propia fila.

### D2 — Resumen general de la carga

Una sola fila con los totales, para confirmar de un vistazo que los tres scripts corrieron completos.

---

## Notas para sustentar

**¿Por qué `LEFT JOIN` y no `NOT IN`?**
Se puede resolver A3 con `NOT IN` o `NOT EXISTS`, y de hecho D1 usa `NOT EXISTS`. Pero `NOT IN` tiene una trampa: si la subconsulta devuelve aunque sea un `NULL`, el resultado entero es vacío. `LEFT JOIN ... WHERE IS NULL` no tiene ese problema y hace explícito qué relación falta.

**¿Por qué `count(DISTINCT ...)` en B1?**
Porque los `LEFT JOIN` encadenados producen el producto cartesiano de los hijos. Un proyecto con 3 hitos y 5 entregas devuelve hasta 15 filas; sin `DISTINCT` el conteo de hitos daría 15 en vez de 3. Es el error más común al armar paneles con agregación.

**¿Dónde está el rendimiento?**
Cada consulta se apoya en un índice del Bloque 2: A1 en `tarea (responsable_id, estado)`, A2 en `entrega (hito_id, version DESC)`, B3 en `hito (proyecto_id, fecha_limite)`, C1 en `observacion (entrega_id, estado)` y en `observacion (resuelta_por_entrega_id)`.

## Ver también
- [[Taller 1 - Enunciado]]
- [[Taller 1 - Bloque 3 (Carga y manipulación)]]
- [[Taller 1 - Bloque 1 (Diseño)]]
