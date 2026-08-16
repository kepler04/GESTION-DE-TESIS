---
title: Alcance
tags:
  - proyecto
---

# Alcance

Queremos mantener el proyecto **cerrado y realista**.

## TesisTrack NO pretende ser

- Un sistema académico completo
- Un sistema de matrícula
- Un sistema de pagos
- Un gestor administrativo universitario
- Un sistema de evaluación automática
- Un detector de plagio
- Una IA que redacte tesis
- Un sistema que evalúe la calidad académica de una tesis

> [!success] Foco
> Seguimiento y trazabilidad del proceso de asesoría.

## Principio de diseño

TesisTrack debe ser una plataforma:

- Simple
- Clara
- Fácil de utilizar
- Centrada en el seguimiento
- Flexible respecto a los hitos
- Con trazabilidad
- Sin funcionalidades innecesarias

La pregunta principal que debe responder el sistema:

> [!question] Para el estudiante
> "¿En qué estado está mi tesis y qué tengo que hacer ahora?"

> [!question] Para el asesor
> "¿Qué ha avanzado el estudiante, qué le falta y qué observaciones siguen pendientes?"

## Universidad específica o plataforma general

El profesor preguntó directamente si TesisTrack será:

**A.** Una plataforma diseñada exclusivamente para una universidad.
**B.** Una plataforma general que pueda ser utilizada por diferentes estudiantes y asesores.

> [!success] Decidido el 2026-08-16 — opción B, plataforma general
> TesisTrack es una plataforma general para el seguimiento de asesorías. Durante el desarrollo y la validación se usa un proceso universitario concreto como referencia, para que el sistema no dependa del reglamento de una sola universidad.
>
> **Consecuencia técnica:** no hay entidad `Institución` en el modelo de datos. Los proyectos existen por sí mismos, sin colgar de una universidad.

Ver [[Decisiones pendientes#Decisión 1 - Universidad específica o plataforma general]]

## Ver también
- [[Problema]]
- [[Objetivos]]
