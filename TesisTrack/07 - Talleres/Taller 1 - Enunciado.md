---
title: Taller 1 - Enunciado
tags:
  - taller
  - curso
aliases:
  - Taller 1 UTEC
  - Diseño e implementación de una base de datos desde cero
---

# Taller 1 — Diseño e Implementación de una Base de Datos desde Cero

> [!info] Origen
> Taller de las sesiones 13, 14 y 15 del curso UTEC. No es uno de los [[Entregables y evaluación|entregables]] calificados del proyecto — es un ejercicio de clase aplicado al caso de negocio de TesisTrack. Se resuelve con Claude en sesión, bloque por bloque.

> [!warning] Diseño hecho desde cero el 2026-08-19
> El caso de negocio (TesisTrack) es el mismo de siempre — ver [[Contexto]], [[Problema]], [[Objetivos]] y [[Alcance]] — pero el modelo de datos, nombres de tabla y decisiones de esquema de este taller se razonaron de nuevo desde el enunciado, sin reutilizar diseños anteriores.

## Objetivo

Aplicar lo visto en las sesiones 13, 14 y 15 al caso de negocio del grupo: diseñar el modelo relacional de la primera versión del sistema, implementarlo en PostgreSQL, cargarlo con datos y consultarlo. Base para seguir construyendo el backend y el frontend del proyecto.

## Duración

1.5 - 2 horas.

## Actividad, bloque por bloque

| Bloque | Actividad |
|---|---|
| 1 — Diseño | Presentar el caso, usuarios y funcionalidades. Identificar entidades, atributos y relaciones (1:1, 1:N, N:M — resolviendo las N:M con tabla intermedia). Construir el ERD con PK y FK. |
| 2 — Construcción del esquema | Traducir el ERD a `CREATE TABLE`. Definir tipos de datos y constraints (`PK`, `FK`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`). Incluir al menos un valor automático con `DEFAULT`. Configurar `ON UPDATE`/`ON DELETE` de las FK y justificar las decisiones. |
| 3 — Carga y manipulación de datos | Insertar datos de prueba con `INSERT INTO`. Practicar `UPDATE` y `DELETE FROM`. Verificar que los datos respeten las restricciones. |
| 4 — Consultas | Responder preguntas de negocio con `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`. Resolver 2-3 preguntas de negocio. Incluir `INNER JOIN`, `JOIN` múltiple y `LEFT JOIN`. Generar reportes con `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`. |
| 5 — Cierre | Presentar el caso, el alcance de la primera versión y el ERD. Explicar decisiones de diseño y mostrar 1-2 consultas clave. |

## Entregables

- Diagrama ERD (imagen o enlace a herramienta de diseño).
- Enunciado breve del caso de negocio, usuarios, problema y alcance.
- Script SQL con la creación del esquema (`CREATE TABLE`).
- Script SQL con la carga de datos de prueba.
- Script SQL con las operaciones de `UPDATE` y `DELETE` realizadas durante el taller.
- Entre 2 y 3 consultas que respondan preguntas de negocio relevantes, con `JOIN`, `LEFT JOIN` y agregación según corresponda.

## Progreso

| Bloque | Nota | Estado |
|---|---|---|
| 1 — Diseño | [[Taller 1 - Bloque 1 (Diseño)]] | ✅ |
| 2 — Esquema | [[Taller 1 - Bloque 2 (Esquema)]] | ✅ |
| 3 — Carga y manipulación | [[Taller 1 - Bloque 3 (Carga y manipulación)]] | ✅ |
| 4 — Consultas | [[Taller 1 - Bloque 4 (Consultas)]] | ✅ |
| 5 — Cierre | [[Taller 1 - Bloque 5 (Cierre y exposición)]] | ✅ |

## Ver también
- [[Taller 1 - Bloque 1 (Diseño)]]
- [[Taller 1 - Bloque 2 (Esquema)]]
- [[Taller 1 - Bloque 3 (Carga y manipulación)]]
- [[Taller 1 - Bloque 4 (Consultas)]]
- [[Taller 1 - Bloque 5 (Cierre y exposición)]]
- [[Contexto]]
- [[Reglas de negocio]]
