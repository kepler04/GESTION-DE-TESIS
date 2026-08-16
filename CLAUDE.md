# TesisTrack

Plataforma web para el seguimiento de asesorías de tesis. Proyecto académico del Programa Especializado en Fundamentos de Programación y Desarrollo Web Full-Stack (trabajo en grupo, evaluado por entregables).

Pregunta que guía toda decisión de alcance: **¿esto ayuda a centralizar asesorías, hitos, tareas, entregas y observaciones en un solo lugar?** Si no, probablemente esté fuera de alcance.

## Estructura

**Monorepo**: `e:\CLAUDE\UTEC` es un único repo git → https://github.com/kepler04/GESTION-DE-TESIS

| Ruta | Qué es |
|---|---|
| `e:\CLAUDE\UTEC\tesistrack-app` | Backend — Spring Boot, API REST |
| `e:\CLAUDE\UTEC\tesistrack-web` | Frontend — React + Vite |
| `e:\CLAUDE\UTEC\TesisTrack` | Copia versionada del vault (documentación de los entregables) |
| `E:\GENERAL\TesisTrack` | **Vault de Obsidian — la fuente de verdad, se edita acá** |

> El vault se edita en `E:\GENERAL\TesisTrack` y se sincroniza hacia `UTEC\TesisTrack` antes de commitear:
> `robocopy "E:\GENERAL\TesisTrack" "e:\CLAUDE\UTEC\TesisTrack" /MIR`
> Nunca edites la copia de `UTEC\TesisTrack` directamente: el próximo sync la pisa.

El despliegue apunta a subcarpetas: Vercel usa `tesistrack-web/` como root directory, AWS construye desde `tesistrack-app/`.

## El vault de Obsidian es la fuente de verdad

El código responde al *qué*; el vault guarda el *por qué*. **Antes de tomar una decisión de diseño o alcance, consultá el vault** — y cuando se tome una decisión nueva, escribila ahí, no solo en el código.

Notas clave (dentro de `E:\GENERAL\TesisTrack\`):

| Nota | Contenido |
|---|---|
| `TesisTrack.md` | Índice (MOC) con el mapa completo |
| `01 - Proyecto/Entregables y evaluación.md` | Los 5 entregables, pesos y qué exige cada uno |
| `01 - Proyecto/Alcance.md` | Qué TesisTrack **no** es |
| `02 - Requisitos/Usuarios y roles.md` | Estudiante / Asesor / Coordinador |
| `02 - Requisitos/Reglas de negocio.md` | Cadenas de trazabilidad |
| `03 - Diseño/Arquitectura.md` | Stack, decisiones técnicas y el porqué de cada una |
| `03 - Diseño/Hitos.md` | Hitos configurables por proyecto |
| `05 - Decisiones/Decisiones pendientes.md` | 8 decisiones abiertas, sin cerrar |

Hay decisiones **todavía abiertas** (estados de un hito, quién los crea, alcance del coordinador). No las asumas cerradas: revisá esa nota y, si hace falta definir una para avanzar, preguntá antes de fijarla en el código.

### CLI de Obsidian

Requiere Obsidian abierto. Si `obsidian` no está en el PATH de la shell:

```
"C:\Users\oscar\AppData\Local\Programs\Obsidian\Obsidian.com" search query="hitos"
```

El vault activo es `GENERAL`; TesisTrack es una carpeta dentro de él, así que las rutas van como `TesisTrack/03 - Diseño/Arquitectura.md`.

## Comandos

```bash
# Base de datos (desde tesistrack-app)
docker compose up -d              # PostgreSQL en :5432

# Backend (desde tesistrack-app) → :8080
./mvnw.cmd spring-boot:run
./mvnw.cmd -q clean compile

# Frontend (desde tesistrack-web) → :5173
npm run dev
npm run build
```

## Stack

Impuesto en parte por el enunciado del curso — no es de libre elección.

- **Backend**: Java 17 + Spring Boot 4.1.0, Maven, Spring Data JPA, Spring Security, PostgreSQL 16
- **Frontend**: React **18.3.1**, Vite
- **Auth**: JWT propio (jjwt 0.12.6), BCrypt, stateless
- **Despliegue previsto**: backend en AWS (exigido), frontend en Vercel

## Convenciones

- **React va fijado en 18.3.1 exacto** en `package.json`, sin `^` ni `~`. El profesor pidió React 18; un salto de mayor rompe código a mitad de proyecto. No lo "actualices" al agregar dependencias.
- **Java 17, no 21.** El JDK instalado es 17 y el `pom.xml` está fijado ahí.
- Paquetes del backend: `controller` / `service` / `repository` / `model` / `dto` / `config`, bajo `com.tesistrack`.
- DTOs como `record`; entidades JPA en `model`.
- Errores de API salen por `ApiExceptionHandler` como JSON `{"error": "..."}` — 400 validación/duplicado, 401 credenciales.
- El rol `COORDINADOR` **no** es autoasignable en el registro.
- Nada de secretos hardcodeados: config sensible por variable de entorno con default de dev (`JWT_SECRET`, `DB_*`, `CORS_ALLOWED_ORIGINS`).

## Verificación

Compilar no alcanza. Para cambios que tocan la UI o el flujo end-to-end, levantá los tres servicios y comprobalo en un navegador real (Playwright está disponible) antes de darlo por hecho.
