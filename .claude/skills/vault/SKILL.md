---
name: vault
description: Consultar y actualizar el vault de Obsidian de TesisTrack (E:\GENERAL\TesisTrack), la fuente de verdad del proyecto. Usar ANTES de tomar cualquier decisión de diseño, alcance, modelo de datos o permisos; DESPUÉS de cerrar una decisión o terminar un entregable, para dejarla escrita; y ANTES de commitear, para sincronizar la copia versionada. Cubre dónde buscar cada tema, el formato de nota (frontmatter, callouts, wikilinks), cómo numerar y cerrar decisiones, y el robocopy de sincronización.
---

# Vault de TesisTrack

El código responde al *qué*; el vault guarda el *por qué* — con las alternativas que se descartaron y la razón. Una decisión que solo vive en el código está a medio tomar.

## Las dos rutas — no las confundas

| Ruta | Rol |
|---|---|
| `E:\GENERAL\TesisTrack` | **El vault real. Se lee y se edita acá.** |
| `e:\CLAUDE\UTEC\TesisTrack` | Copia versionada dentro del repo. **Solo escribe el robocopy.** |

Editar la copia del repo es trabajo perdido: el próximo sync la pisa con `/MIR`. Si te encontrás leyendo un archivo bajo `UTEC\TesisTrack`, abrí el equivalente en `E:\GENERAL\TesisTrack` antes de escribir.

El vault activo de Obsidian es `GENERAL`; TesisTrack es una carpeta adentro. En el CLI las rutas van como `TesisTrack/03 - Diseño/Arquitectura.md`.

## Cómo leer el vault

Son archivos markdown planos: **Read, Grep y Glob funcionan siempre** y son el camino por defecto. El CLI de Obsidian solo agrega valor para búsqueda semántica o para escribir con la app abierta, y **requiere Obsidian corriendo** — si no lo está, falla con "unable to find Obsidian". No lo abras vos; caé al acceso por archivo.

```bash
# Búsqueda por contenido en todo el vault
grep -rn "coordinador" "E:\GENERAL\TesisTrack"

# CLI (solo si Obsidian ya está abierto y `obsidian` no está en PATH)
"C:\Users\oscar\AppData\Local\Programs\Obsidian\Obsidian.com" search query="hitos"
```

## Dónde vive cada tema

Empezá por `TesisTrack.md` (el MOC): tiene el mapa completo y una sección **Estado actual** con el entregable en curso.

| Pregunta que tenés | Nota |
|---|---|
| ¿Esto entra en el alcance? | `01 - Proyecto/Alcance.md` — la lista de lo que TesisTrack **no** es |
| ¿Qué exige el curso, con qué peso? | `01 - Proyecto/Entregables y evaluación.md` |
| ¿Quién puede hacer qué? | `02 - Requisitos/Usuarios y roles.md` — incluye la matriz de permisos |
| ¿Cómo se encadenan hitos/entregas/observaciones? | `02 - Requisitos/Reglas de negocio.md` |
| ¿Por qué este stack / esta librería? | `03 - Diseño/Arquitectura.md` |
| ¿Qué tablas y columnas hay? | `03 - Diseño/Base de datos.md` |
| ¿Qué endpoints existen? | `03 - Diseño/API.md` |
| Estados y ciclo del hito | `03 - Diseño/Hitos.md` |
| ¿Por qué se decidió así? | `05 - Decisiones/Decisiones pendientes.md` |
| ¿Cómo levanto todo? ¿Usuarios de prueba? | `06 - Desarrollo/Desarrollo.md` |
| ¿Qué pidió el profesor? | `04 - Reuniones/Feedback profesor.md` |

## Decisiones

Las 8 decisiones de alcance están **cerradas desde el 2026-08-16**. El código las cita por número (`AccesoService` menciona la 7 y la 8); cuando veas una referencia así, la nota tiene el razonamiento y las alternativas descartadas.

No reabras una decisión cerrada por tu cuenta. Si el trabajo actual la contradice, decilo y preguntá.

Para una decisión **nueva**, agregá una sección al final de `Decisiones pendientes.md` siguiendo el formato existente:

```markdown
## Decisión 9 - Título corto en infinitivo o pregunta

¿La pregunta concreta que había que responder?

**Estado:** ✅ cerrada (YYYY-MM-DD) — **la respuesta en negrita, en pocas palabras**

Qué se resolvió y por qué. Nombrá explícitamente **qué alternativa se descartó y por qué** —
esa es la parte que el código no puede guardar.

> [!note] Consecuencia
> El efecto concreto en el modelo, la API o la UI.

Ver [[Nota relacionada#Sección]].
```

Cerrada una decisión, actualizá también la nota temática que toca (`Hitos`, `Usuarios y roles`, `Base de datos`…) para que no queden contradiciéndose.

## Convenciones de escritura

- **Frontmatter** en toda nota: `title` y `tags` (`proyecto`, `diseño`, `requisitos`, `decisiones`, `desarrollo`, `reunion`). `aliases` cuando la nota se cita con otro nombre.
- **Wikilinks** `[[Nota]]` o `[[Nota#Sección]]` para todo enlace interno; los enlaces son la estructura del vault. `[[Nota|texto visible]]` cuando el nombre no encaja en la frase.
- **Callouts** de Obsidian con intención, no decorativos: `> [!success]` decisión tomada o hito logrado, `> [!warning]` trampa o cambio que invalida algo anterior, `> [!important]` regla que hay que respetar, `> [!note]` consecuencia, `> [!abstract]` resumen, `> [!info]` origen de un dato.
- **Fechas absolutas** (`2026-08-16`), nunca "hoy" ni "la semana pasada".
- **Español rioplatense**, igual que el resto del vault y del código.
- Tablas para comparar opciones; `mermaid` para flujos.
- Al actualizar una nota, ajustá también el bloque **Estado actual** del MOC `TesisTrack.md` si cambió el entregable en curso.

## Sincronizar antes de commitear

Si tocaste el vault y vas a commitear el repo, sincronizá primero:

```powershell
robocopy "E:\GENERAL\TesisTrack" "e:\CLAUDE\UTEC\TesisTrack" /MIR
```

`/MIR` es espejo: borra en el destino lo que no está en el origen. Es lo que queremos acá, pero confirmá que el origen es el vault real antes de correrlo. Robocopy devuelve códigos de salida donde 0–7 son éxito (1 = archivos copiados, 3 = copiados y extras borrados); solo ≥8 es error real.

Después revisá `git status` para ver que los cambios del vault entraron en el commit junto con el código que documentan.
