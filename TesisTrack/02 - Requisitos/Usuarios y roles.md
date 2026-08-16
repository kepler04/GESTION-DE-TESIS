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
| Registrar asesoría / acuerdo | ❌ | ✅ | ❌ |
| Crear tarea | ❌ | ✅ | ❌ |
| Completar tarea | ✅ si es responsable | ✅ | ❌ |

## Ver también
- [[Funcionalidades]]
- [[Reglas de negocio]]
- [[API]]
