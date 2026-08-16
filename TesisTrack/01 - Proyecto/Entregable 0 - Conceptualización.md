---
title: Entregable 0 - Conceptualización
tags:
  - proyecto
  - curso
  - entregable
aliases:
  - Conceptualización
  - Documento de conceptualización
---

# Entregable 0 — Conceptualización

> [!info] Qué es esta nota
> El **documento formal** del [[Entregables y evaluación#Entregable 0 — Conceptualización (requisitos)|Entregable 0]], redactado el 2026-08-16. No se califica, pero es la vía por la que el profesor da retroalimentación — ver [[Feedback profesor]].
>
> Las notas de `01 - Proyecto` y `02 - Requisitos` son la fuente; esta las consolida en el texto a entregar. Si una decisión cambia, se actualiza **primero la nota temática** y después este documento.

## 1. Nombre del proyecto

**TesisTrack** – Plataforma web para el seguimiento de asesorías de tesis.

## 2. Contexto

El desarrollo de una tesis implica un proceso continuo de asesorías, entregas, correcciones y cumplimiento de fechas. Durante este proceso, estudiantes y asesores intercambian información mediante diferentes medios, como correos electrónicos, servicios de mensajería, documentos y reuniones presenciales o virtuales.

Cuando esta información se encuentra dispersa, puede ser difícil identificar qué actividades ya fueron realizadas, qué observaciones continúan pendientes, cuál fue la última versión entregada y qué actividades deben realizarse a continuación.

Esta situación puede generar pérdida de información, dificultades para consultar el historial de asesorías y poca claridad sobre el avance real del proyecto de tesis.

Ante esta problemática, se propone TesisTrack, una plataforma web enfocada específicamente en centralizar y organizar el seguimiento de las asesorías de tesis, permitiendo registrar los principales eventos del proceso: reuniones, acuerdos, tareas, entregas, observaciones e hitos.

La plataforma no busca reemplazar el proceso académico de elaboración de la tesis ni gestionar trámites institucionales, sino proporcionar un espacio único para registrar, consultar y dar seguimiento a la información generada durante las asesorías.

Ver [[Contexto]] y [[Problema]].

## 3. Objetivos

### Objetivo general

Desarrollar una plataforma web para centralizar y facilitar el seguimiento de las asesorías de proyectos de tesis, permitiendo registrar y consultar de manera organizada sus hitos, reuniones, entregas, observaciones y tareas pendientes.

### Objetivos específicos

1. Registrar proyectos de tesis y vincularlos con sus respectivos estudiantes y asesores.
2. Definir los principales hitos del proyecto y sus fechas de entrega.
3. Registrar las reuniones de asesoría realizadas durante el desarrollo de la tesis.
4. Registrar los acuerdos y tareas asignadas durante cada reunión.
5. Registrar las entregas de documentos asociadas a los diferentes hitos.
6. Permitir que el asesor registre observaciones sobre las entregas realizadas.
7. Mantener un historial cronológico de reuniones, entregas y observaciones.
8. Mostrar las tareas pendientes y las próximas fechas de entrega del proyecto.
9. Visualizar el estado actual del proyecto mediante el cumplimiento de sus hitos.
10. Facilitar la consulta del historial de asesoría desde un único espacio.

Ver [[Objetivos]].

## 4. Justificación

El principal problema identificado es la **dispersión de la información** generada durante el proceso de asesoría de tesis. Las reuniones, acuerdos, entregas, observaciones y fechas suelen registrarse en diferentes medios, lo que dificulta realizar un seguimiento ordenado del proyecto.

Por ejemplo, un estudiante puede recibir una observación durante una reunión, realizar una nueva entrega posteriormente y recibir nuevas correcciones mediante otro medio. Sin un registro centralizado, puede resultar complicado determinar qué observaciones fueron atendidas, qué tareas continúan pendientes y cuál es la versión más reciente del documento.

TesisTrack aborda este problema mediante una plataforma orientada exclusivamente al seguimiento de la asesoría. Cada proyecto contará con un espacio donde se podrán consultar sus hitos, reuniones, tareas, entregas y observaciones, manteniendo un historial organizado del proceso.

De esta manera, la solución busca mejorar la organización, trazabilidad y visibilidad del avance de la tesis, sin ampliar el proyecto hacia funciones que no son necesarias para resolver el problema principal.

## 5. Alcance del proyecto

TesisTrack estará centrado en el seguimiento de proyectos de tesis durante el proceso de asesoría.

**El sistema permitirá gestionar:**

- Usuarios con roles de estudiante, asesor y coordinador.
- Proyectos de tesis.
- Hitos y fechas de entrega.
- Reuniones de asesoría.
- Acuerdos y tareas pendientes.
- Entregas de documentos.
- Observaciones realizadas por los asesores.
- Estados de hitos y tareas.
- Historial del proyecto.
- Panel de seguimiento con información relevante del avance.

**El sistema no incluirá funcionalidades como:**

- Redacción automática de tesis.
- Corrección académica o detección de plagio.
- Evaluación automática de tesis.
- Gestión de matrículas o pagos.
- Gestión administrativa de la universidad.
- Programación automática de horarios institucionales.
- Integración obligatoria con sistemas académicos externos.

De esta manera, el proyecto mantiene un alcance definido y se concentra en resolver el problema de organización y seguimiento de las asesorías.

Ver [[Alcance]].

## 6. Funcionalidades principales

### 6.1. Gestión de usuarios

El sistema permitirá registrar e iniciar sesión a los usuarios y diferenciar sus funcionalidades según su rol:

- **Estudiante:** podrá consultar su proyecto, registrar o visualizar entregas, revisar observaciones, consultar tareas y conocer las próximas fechas.
- **Asesor:** podrá consultar los proyectos asignados, registrar reuniones, acuerdos, tareas, observaciones y revisar las entregas realizadas por los estudiantes.
- **Coordinador académico:** podrá consultar el estado general de los proyectos registrados y realizar seguimiento de su avance.

Ver [[Usuarios y roles]].

### 6.2. Gestión del proyecto de tesis

Cada proyecto tendrá información básica como:

- Título de la tesis.
- Estudiante o estudiantes asociados.
- Asesor asignado.
- Estado del proyecto.
- Fecha de inicio.
- Hitos definidos.

El proyecto funcionará como el espacio principal donde se concentrará toda la información relacionada con su seguimiento.

### 6.3. Gestión de hitos

El asesor o usuario autorizado podrá definir los principales hitos del proyecto, indicando:

- Nombre del hito.
- Descripción.
- Fecha límite.
- Estado.
- Entrega asociada.

Esto permitirá comparar las fechas planificadas con el avance registrado.

Ver [[Hitos]].

### 6.4. Registro de asesorías

Cada reunión de asesoría podrá registrar:

- Fecha de la reunión.
- Tema tratado.
- Resumen de la reunión.
- Acuerdos establecidos.
- Tareas pendientes.
- Fecha o plazo de cumplimiento.

Así se mantendrá un historial de lo tratado en cada asesoría.

### 6.5. Gestión de entregas

Los estudiantes podrán registrar las entregas correspondientes a los hitos definidos. Cada entrega podrá almacenar:

- Hito relacionado.
- Fecha de entrega.
- Versión del documento.
- Archivo entregado.
- Estado de la entrega.

Esto permitirá identificar cuál fue la última entrega realizada.

### 6.6. Registro de observaciones

El asesor podrá registrar observaciones relacionadas con una entrega específica. Cada observación podrá indicar:

- Comentario u observación.
- Fecha.
- Entrega a la que pertenece.
- Estado de la observación.

Esto permitirá identificar qué correcciones aún deben ser atendidas.

### 6.7. Tareas pendientes

Las tareas generadas durante las asesorías podrán registrarse y marcarse como pendientes o completadas. El sistema permitirá consultar de manera rápida:

- Tareas pendientes.
- Tareas completadas.
- Fecha límite de cada tarea.
- Reunión en la que fue establecida.

### 6.8. Panel de seguimiento

Cada proyecto contará con un panel que muestre de manera resumida:

- Estado actual del proyecto.
- Hitos completados y pendientes.
- Próximas fechas de entrega.
- Últimas entregas realizadas.
- Observaciones pendientes.
- Tareas pendientes.
- Últimas asesorías registradas.

El objetivo del panel será proporcionar una vista rápida del estado actual de la tesis sin tener que revisar cada registro individualmente.

### 6.9. Historial del proyecto

La plataforma conservará un historial organizado de los principales eventos del proyecto:

```
Asesoría → Acuerdos → Tareas → Entrega → Observaciones → Nueva entrega
```

Esto permitirá reconstruir el proceso de seguimiento y conocer la evolución de la tesis a lo largo del tiempo.

Ver [[Reglas de negocio]] y [[Funcionalidades]].

## 7. Resultado esperado

Como resultado, se espera contar con una plataforma web en la que estudiantes, asesores y coordinadores puedan consultar de manera organizada el estado de un proyecto de tesis.

La plataforma permitirá responder rápidamente preguntas como:

- ¿Cuál es el estado actual de la tesis?
- ¿Qué hito sigue?
- ¿Qué tareas están pendientes?
- ¿Cuál fue la última entrega?
- ¿Qué observaciones aún deben atenderse?
- ¿Qué se acordó en la última asesoría?

De esta manera, TesisTrack proporcionará un mecanismo centralizado para mejorar el seguimiento y la trazabilidad del proceso de asesoría de tesis.

---

## El sistema se ajustó a este documento

> [!success] Resuelto el 2026-08-16 — el documento mandó
> Al redactarlo aparecieron cinco diferencias con lo construido. En vez de ablandar el texto, **se cambió el sistema**. Ya no hay contradicciones que puedan aparecer en la defensa.

| Punto del documento | Qué se hizo |
|---|---|
| 6.2 — *"Estudiante **o estudiantes** asociados"* | **Se implementaron las tesis grupales.** Revierte el supuesto 1 de [[Base de datos]], que estaba marcado para revisar — ver [[Decisiones pendientes#Decisión 15 - Tesis grupales\|Decisión 15]] |
| 6.2 — *"Fecha de inicio"* | Columna propia `fecha_inicio`, separada de `created_at`: una tesis puede haber arrancado antes de registrarse en la plataforma |
| 6.3 — *"El asesor o usuario autorizado"* | Sin cambio: el asesor del proyecto **es** el usuario autorizado ([[Decisiones pendientes#Decisión 2 - Quién crea los hitos\|Decisión 2]]) |
| 6.5 — *"Archivo entregado"* | **Carga real de archivos**, guardados en PostgreSQL, con descarga — ver [[Decisiones pendientes#Decisión 16 - Dónde se guardan los archivos de las entregas\|Decisión 16]] |
| 6.5 — *"Estado de la entrega"* | `EstadoEntrega` propio de cada versión: `En revisión`, `Observada`, `Aprobada` |

> [!note] Lo que el documento no menciona y sí existe
> Durante el desarrollo aparecieron los **espacios de trabajo del asesor** con código de invitación y actividades repartidas a todo el grupo ([[Decisiones pendientes#Decisión 10 - Áreas del asesor\|D10]], [[Decisiones pendientes#Decisión 11 - Cómo entran los asesorados de un asesor privado\|D11]] y [[Decisiones pendientes#Decisión 12 - Cómo se reparte una actividad a todo un espacio\|D12]]). Resuelven cómo se vinculan estudiante y asesor —el objetivo específico 1— y conviene mencionarlos si el documento se vuelve a presentar.

## Ver también
- [[Entregables y evaluación]]
- [[Auditoría de requisitos]]
- [[TesisTrack]]
