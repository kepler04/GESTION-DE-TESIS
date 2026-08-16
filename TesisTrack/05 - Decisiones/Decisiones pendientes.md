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

## Ver también
- [[Feedback profesor]]
- [[TesisTrack]]
