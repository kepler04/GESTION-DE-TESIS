---
title: Reglas de negocio
tags:
  - requisitos
---

# Reglas de negocio

> [!warning] En construcción
> Estas reglas todavía no están cerradas — dependen de las [[Decisiones pendientes]].

## Relación entre elementos

Cadena de trazabilidad de hitos y entregas:

```mermaid
graph TD
    A[Proyecto de tesis] --> B[Hitos]
    B --> C[Entregas]
    C --> D[Observaciones]
    D --> E[Correcciones]
```

Cadena paralela de seguimiento de asesorías:

```mermaid
graph TD
    A[Proyecto] --> B[Asesorías]
    B --> C[Acuerdos]
    C --> D[Tareas]
    D --> E[Cumplimiento]
```

Ambas cadenas alimentan el [[#Historial]] del proyecto.

### Ejemplo de flujo completo

```mermaid
graph TD
    A["Hito: Marco teórico"] --> B["Asesoría: Revisar antecedentes"]
    B --> C["Tarea: Agregar 5 antecedentes"]
    C --> D["Entrega: Marco teorico_v2.pdf"]
    D --> E["Observación: Faltan antecedentes internacionales"]
    E --> F["Nueva entrega: Marco teorico_v3.pdf"]
```

> [!important]
> TesisTrack no solo debe almacenar archivos: debe permitir seguir el proceso que ocurre alrededor de esos archivos.

## Historial

Debe ser posible reconstruir el proceso completo:

```mermaid
graph LR
    A[Asesoría] --> B[Acuerdo] --> C[Tarea] --> D[Entrega] --> E[Observación] --> F[Corrección] --> G[Nueva entrega]
```

Esto permite que un estudiante o asesor consulte qué ocurrió durante el desarrollo de la tesis.

## Reglas pendientes de definir
- ¿Cómo se relaciona un hito con las entregas? → [[Decisiones pendientes#Decisión 5 - Relación hito-entrega]]
- ¿Cómo se relacionan las observaciones con las versiones de una entrega? → [[Decisiones pendientes#Decisión 6 - Observaciones y versiones]]
- ¿Los hitos pueden modificarse después de crear el proyecto? → [[Decisiones pendientes#Decisión 4 - Modificación de hitos]]

## Ver también
- [[Hitos]]
- [[Flujo del sistema]]
