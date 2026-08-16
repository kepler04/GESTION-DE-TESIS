---
title: Auditoría de requisitos
tags:
  - proyecto
  - curso
aliases:
  - Qué falta
  - Brecha contra el enunciado
---

# Auditoría de requisitos — 2026-08-16

> [!info] Por qué existe esta nota
> Después de varias sesiones construyendo a pedido, se paró a contrastar **lo construido contra lo que el curso exige**. Esta nota es esa comparación, hecha leyendo [[Entregables y evaluación]], [[Funcionalidades]], [[Alcance]] y [[Feedback profesor]] contra el código real.

> [!warning] El hallazgo principal
> **El 45% de la nota está sin empezar** y el entregable en curso todavía tiene dos grupos de funcionalidades listadas en placeholder — mientras que buena parte del trabajo reciente fue a cosas que el enunciado no pide.
>
> No es que lo construido esté mal. Es que **no está priorizado por la rúbrica**.

## Dónde está la nota

| Entregable | Peso | Estado real |
|---|---|---|
| 1 — Modelo de Datos | 15% | ✅ terminado y verificado |
| 2 — Backend | 20% | ✅ terminado, 31 pruebas |
| 3 — Full-Stack | 20% | ✅ **funcionalidades completas** — queda el menú del coordinador |
| 4 — CI/CD y Despliegue | 15% | ⬜ **sin empezar** |
| Final — Competencia | 30% | ⬜ **sin empezar** |

**Asegurado: 35%. En curso: 20%. Sin tocar: 45%.**

## A. Lo que el enunciado pide y todavía no está

### A1 y A2. Asesorías y Tareas — ✅ resueltas el 2026-08-16

> [!success] Cerradas el mismo día de la auditoría
> Las dos pantallas se construyeron dentro del trabajo de [[Desarrollo#Espacios de trabajo del asesor|espacios de trabajo]], no como un desvío: el canal de dudas del asesor privado **es** Asesorías ([[Decisiones pendientes#Decisión 13 - Quién puede abrir una asesoría|Decisión 13]]), y las tareas cierran la cadena.
>
> Ya no queda ninguna ruta en `PendientePage` — el componente se borró. La cadena `Asesoría → Acuerdo → Tarea` se puede recorrer entera desde la aplicación.

### A3. "Subir documento" ✅ resuelto el 2026-08-16

Los archivos se guardan **en PostgreSQL**, con descarga y tope de 15 MB ([[Decisiones pendientes#Decisión 16 - Dónde se guardan los archivos de las entregas|Decisión 16]]). Se descartó S3 —necesita accesos que el grupo todavía no tiene— y el filesystem, que en AWS no sobrevive a un redespliegue.

Con esto **[[Funcionalidades]] queda cubierta por completo**.

### A4. Entregable 4 — CI/CD y despliegue (15%)

Nada empezado: no hay pipeline de GitHub Actions, no hay backend en AWS, no hay frontend en Vercel, y `JWT_SECRET` sigue con el default de desarrollo.

### A5. Competencia Final (30%)

Es **el entregable de mayor peso** y no hay nada preparado: ni guion de demo, ni datos de demostración limpios, ni pitch. Ver [[#Riesgos]].

### A6. Entregable 0 — documento formal ✅ redactado el 2026-08-16

Consolidado en [[Entregable 0 - Conceptualización]]. **Falta entregarlo.**

Al redactarlo aparecieron cinco diferencias entre lo propuesto y lo construido —tesis grupales, "estado de la entrega", carga de archivos, quién crea los hitos—. Están tabuladas al final de esa nota: conviene resolverlas **antes** de presentarlo.

## B. Lo construido que el enunciado no pide

No es una lista de errores: varias de estas cosas son buenas y algunas las pediste explícitamente. Es para tener presente **qué se pagó con tiempo que no vuelve en nota**.

| Construido | ¿Lo pide el curso? | Veredicto |
|---|---|---|
| **Mis asesorados** | No está en [[Funcionalidades]] | ✅ **Defendible**: responde textualmente la pregunta que [[Alcance]] fija para el asesor — *"¿qué ha avanzado el estudiante, qué le falta y qué observaciones siguen pendientes?"* |
| **Carpetas + código de invitación** | No | ✅ **Defendible**: es el mecanismo de *"Asociar asesor"* ([[Funcionalidades#Proyectos]]) y encaja con la [[Decisiones pendientes#Decisión 1 - Universidad específica o plataforma general\|plataforma general sin institución]] |
| **Landing pública** | No | 🟡 **Útil para la Competencia Final**, que evalúa presentación y pitch |
| **Registro en dos pasos + política de privacidad** | No | 🟡 **Defendible por riesgo legal**, no por rúbrica. Costó tiempo y quedó a medias: 7 `[corchetes]` sin completar |
| **Medidor de fuerza de contraseña** | No | 🟠 **Accesorio** |
| **Telón de bienvenida** | No | 🔴 **Decoración pura**. Contradice el principio *"sin funcionalidades innecesarias"* de [[Alcance#Principio de diseño]] |

> [!note] Lo que esto enseña, más que lo que juzga
> El patrón es claro: cada sesión salió de una idea puntual, y ninguna se contrastó contra [[Funcionalidades]] antes de construirse. Ninguna decisión fue mala por sí sola; el problema es **acumulativo**.
>
> Regla para adelante: **antes de construir, verificar si está en [[Funcionalidades]]**. Si no está, decidir a conciencia si entra igual y anotarlo — no descubrirlo después.

## C. Lo que sí está bien cubierto

Para no leer esto como si nada funcionara:

- **Autenticación** — registro, login y control por rol: completo, y con [[API|autorización por pertenencia]] más fina que lo pedido.
- **Proyectos** — las 5 funcionalidades listadas están.
- **Hitos** — las 5 listadas están, con los 5 estados de la [[Decisiones pendientes|Decisión 3]].
- **Entregas** — 4 de 5 (falta la carga real de archivos).
- **Observaciones** — las 4 listadas están.
- **Dashboard** — los 6 bloques que pide [[Funcionalidades#Dashboard]] están.

## D. Riesgos

> [!warning] Riesgo 1 — La Competencia Final vale más que todo el desarrollo junto
> 30% contra el 20% del Entregable 3. Se evalúa **demostración funcional y pitch**, no cantidad de pantallas. Una demo fluida de lo que ya anda vale más que una pantalla más a medio terminar.

> [!warning] Riesgo 2 — Datos de prueba sucios
> La base local tiene 16 usuarios, la mayoría basura de tests (`Ana Tester`, `Debug Uno`, `Taller privado 1786906649`). Para la demo hace falta un juego de datos limpio y creíble: un estudiante, un asesor, una tesis con hitos en distintos estados y un ciclo de corrección completo. **Conviene prepararlo antes, no la noche anterior.**

> [!success] Riesgo 3 — resuelto a medias el 2026-08-16
> Los 88 archivos del Entregable 3 quedaron commiteados en la rama `entregable-3-espacios`. **Falta pushear**: mientras no se suba, el respaldo depende de un solo disco.

> [!warning] Riesgo 4 — El menú del coordinador contradice la Decisión 8
> `AppLayout` le esconde Entregas, Observaciones, Asesorías y Tareas, pero la [[Decisiones pendientes#Decisión 8 - Alcance del coordinador\|Decisión 8]] dice que puede consultarlas. Si el profesor prueba el rol coordinador, la aplicación contradice su propia documentación.

## E. Orden sugerido

Ordenado por **nota por hora invertida**, no por lo que sea más entretenido de construir.

1. **Pushear.** El commit ya está hecho (`entregable-3-espacios`); falta subirlo. ⬅ **lo único urgente que queda**
2. ~~Asesorías + Acuerdos y Tareas~~ ✅ hechas el 2026-08-16.
3. **Resolver el menú del coordinador.** Una línea. Elimina una contradicción visible.
4. ~~Decidir la carga de archivos~~ ✅ resuelta el 2026-08-16: van en PostgreSQL.
5. **Entregable 4: CI/CD + despliegue** (15%). Es trabajo de configuración, poco código, y no depende de las pantallas que falten.
6. **Preparar la Competencia Final** (30%): datos limpios, guion de demo, pitch.

> [!note] Lo que esta lista deja afuera a propósito
> Los 7 `[corchetes]` de la política de privacidad y la recuperación de contraseña. Ninguno de los dos suma a la rúbrica, y el primero necesita datos del equipo, no código.

## Ver también
- [[Entregables y evaluación]]
- [[Funcionalidades]]
- [[Alcance]]
- [[Desarrollo]]
- [[Decisiones pendientes]]
