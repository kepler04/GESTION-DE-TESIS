---
title: Flujo del sistema
tags:
  - diseño
---

# Flujo del sistema

> [!info] Estado
> Pendiente de diseñar en detalle. Placeholder inicial basado en el contexto del proyecto.

## Flujo de trabajo general (proceso, no aún UI)

```mermaid
graph TD
    A[Problema] --> B[Usuarios]
    B --> C[Casos de uso]
    C --> D[Requisitos]
    D --> E[Reglas de negocio]
    E --> F[Flujos]
    F --> G[Modelo de datos]
    G --> H[Diseño UI]
    H --> I[Desarrollo]
    I --> J[Pruebas]
```

## Creación de un proyecto

> [!success] Decidido el 2026-08-16 — lo crea el estudiante

```mermaid
graph LR
    A[Estudiante se registra] --> B[Crea su proyecto]
    B --> C[Elige asesor de la lista]
    C --> D[El asesor define los hitos]
    D --> E[El estudiante entrega contra cada hito]
```

El asesor es **opcional al crear**: el proyecto puede existir sin asesor y asignarse después. Pero hasta que no haya asesor no puede haber hitos, porque los crea él ([[Decisiones pendientes#Decisión 2 - Quién crea los hitos|D2]]).

Se eligió sobre "lo crea el coordinador" porque encaja con [[Alcance|D1, plataforma general]]: no depende de que exista un coordinador cargando todo a mano.

## Por definir
- Flujo del dashboard por rol (el endpoint de resumen ya existe, falta el diseño de la pantalla)

## Ver también
- [[Reglas de negocio]]
- [[Arquitectura]]
- [[Base de datos]]
