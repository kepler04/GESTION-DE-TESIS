---
title: Usuarios y roles
tags:
  - requisitos
---

# Usuarios y roles

Inicialmente se consideran tres tipos de usuarios.

## Estudiante

Puede:
- Consultar su proyecto
- Consultar los hitos
- Ver fechas de entrega
- Realizar entregas
- Consultar observaciones
- Consultar tareas pendientes
- Revisar el historial de asesorías

## Asesor

Puede:
- Consultar proyectos asignados
- Gestionar o revisar hitos según los permisos definidos
- Registrar asesorías
- Registrar acuerdos
- Crear tareas
- Revisar entregas
- Registrar observaciones
- Consultar el historial del proyecto

## Coordinador académico

> [!success] Definido el 2026-08-16 — solo lectura, global
> Consulta todos los proyectos y su avance, pero **no crea ni modifica nada**. Ver [[Decisiones pendientes#Decisión 8 - Alcance del coordinador]].

Puede:
- Consultar cualquier proyecto de la plataforma
- Supervisar el estado general de los proyectos
- Visualizar avances y cumplimiento de hitos

No puede: crear proyectos, hitos, asesorías, tareas ni observaciones; tampoco asignar asesores.

## Matriz de permisos

> [!success] Definida el 2026-08-16 — [[Decisiones pendientes#Decisión 7 - Permisos por rol]]

**Regla base:** el acceso se resuelve por **pertenencia al proyecto**, no solo por rol. Un usuario con rol `ASESOR` no puede tocar un proyecto que no le fue asignado. El coordinador es la única excepción: lee todo.

| Acción | Estudiante | Asesor | Coordinador |
|---|:---:|:---:|:---:|
| Crear proyecto | ✅ (el suyo) | ❌ | ❌ |
| Ver proyecto | ✅ solo el suyo | ✅ solo los asignados | ✅ todos |
| Asignar / cambiar asesor | ✅ (en su proyecto) | ❌ | ❌ |
| Crear / editar hito | ❌ | ✅ | ❌ |
| Borrar hito | ❌ | ✅ solo si no tiene entregas | ❌ |
| Cambiar estado del hito | ❌ | ✅ | ❌ |
| Subir entrega | ✅ | ❌ | ❌ |
| Registrar observación | ❌ | ✅ | ❌ |
| Resolver observación | ❌ | ✅ | ❌ |
| Abrir asesoría / consulta | ✅ | ✅ | ❌ |
| Programar una reunión (asesoría con fecha y enlace) | ✅ | ✅ | ❌ |
| Reprogramar o cancelar una reunión programada | ✅ solo la que abrió | ✅ | ❌ |
| Marcar una asesoría como realizada | ❌ | ✅ | ❌ |
| Registrar acuerdo (solo de una asesoría realizada) | ❌ | ✅ | ❌ |
| Crear actividad de un espacio | ❌ | ✅ dueño del área | ❌ |
| Ver el tablero de un espacio | ❌ | ✅ dueño del área | ❌ |
| Ver un espacio: sesiones y materiales | ✅ si tiene una tesis en él | ✅ dueño del área | ✅ solo lectura |
| Descargar un material del espacio | ✅ si tiene una tesis en él | ✅ dueño del área | ✅ |
| Crear / editar / borrar carpetas, materiales y sesiones | ❌ | ✅ dueño del área | ❌ |
| Ver el código de invitación de un espacio | ❌ | ✅ dueño del área | ❌ |
| Crear tarea | ❌ | ✅ | ❌ |
| Completar tarea | ✅ si es responsable | ✅ | ❌ |

> [!note] El estudiante abre la asesoría, no el acuerdo
> Es la [[Decisiones pendientes#Decisión 13 - Quién puede abrir una asesoría|Decisión 13]]: cualquiera de los dos deja constancia de una conversación, pero **solo el asesor decide qué de eso se vuelve un acuerdo** —y de ahí, una tarea—. Con la [[Decisiones pendientes#Decisión 20 - Reuniones con enlace - sesiones del espacio y asesorías programadas|Decisión 20]] el estudiante también puede *proponer* una reunión, pero marcarla realizada sigue siendo del asesor.

> [!note] Los espacios y la pertenencia
> "Miembro de un espacio" no es un rol nuevo: es el estudiante que tiene una tesis en él o el asesor que es su dueño. Se resuelve con la misma regla de pertenencia de siempre ([[Decisiones pendientes#Decisión 19 - Cómo se organizan los materiales del espacio|Decisión 19]]).

## Ver también
- [[Funcionalidades]]
- [[Reglas de negocio]]
- [[API]]
