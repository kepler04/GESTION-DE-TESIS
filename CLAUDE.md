# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
| `05 - Decisiones/Decisiones pendientes.md` | Las 8 decisiones de alcance, todas cerradas el 2026-08-16 |

**Las 8 decisiones están cerradas** (hitos configurables creados por el asesor, plataforma general, 5 estados de hito, coordinador de solo lectura…). No las reabras por tu cuenta. Si surge una decisión nueva, va a esa misma nota con su fecha y su justificación, no solo al código.

Las decisiones se referencian por número desde el código (ej. `AccesoService` cita "Decisión 7" y "Decisión 8"). Cuando veas una de esas referencias, la nota del vault tiene el razonamiento completo y qué alternativas se descartaron.

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
./mvnw.cmd test                             # requiere PostgreSQL levantado
./mvnw.cmd test -Dtest=NombreDeLaClase      # una sola clase
./mvnw.cmd test -Dtest=NombreDeLaClase#unMetodo

# Frontend (desde tesistrack-web) → :5173
npm run dev
npm run build
npm run lint                      # oxlint
```

`npm run lint` usa **oxlint**, no ESLint — no hay `.eslintrc`. Los comentarios `// eslint-disable-next-line` que hay en el código son decorativos para el lector.

Los tests del backend son `@SpringBootTest` y levantan el contexto completo, así que **fallan sin la base de datos corriendo**. Hoy solo existe `TesistrackApplicationTests#contextLoads`.

El frontend lee `VITE_API_URL` de `.env` (hay un `.env.example`); sin esa variable cae a `http://localhost:8080`.

## Stack

Impuesto en parte por el enunciado del curso — no es de libre elección.

- **Backend**: Java 17 + Spring Boot 4.1.0, Maven, Spring Data JPA, Spring Security, PostgreSQL 16
- **Frontend**: React **18.3.1**, React Router 6.30.4, Vite 8
- **Auth**: JWT propio (jjwt 0.12.6), BCrypt, stateless
- **Despliegue previsto**: backend en AWS (exigido), frontend en Vercel

Ojo con Spring Boot 4: los starters cambiaron de nombre respecto de Boot 3. Acá se usa `spring-boot-starter-webmvc` (no `-web`) y los starters de test están partidos por módulo (`spring-boot-starter-webmvc-test`, `-data-jpa-test`, `-security-test`, `-validation-test`).

## Arquitectura

### Modelo de dominio: dos cadenas de trazabilidad

`Proyecto` es la raíz de todo. Cada proyecto tiene un `estudiante` (obligatorio) y un `asesor` (opcional — el proyecto existe antes de que se le asigne uno). De ahí salen dos cadenas, y **casi toda feature nueva cuelga de una de las dos**:

```
Proyecto ─┬─ Hito ─── Entrega ─── Observacion
          └─ Asesoria ─── Acuerdo ─── Tarea
```

Los hitos son configurables por proyecto (no hay lista fija global) y tienen `orden` para mostrarlos en secuencia. `EstadoHito`: PENDIENTE → EN_PROCESO → ENTREGADO → OBSERVADO → COMPLETADO, donde OBSERVADO vuelve a ENTREGADO cuando el estudiante sube una versión corregida.

Sin migraciones: `spring.jpa.hibernate.ddl-auto=update`. El esquema sale de las entidades JPA. Un cambio de entidad que Hibernate no pueda aplicar solo (renombrar columna, cambiar tipo) hay que resolverlo a mano en la base.

### Autorización: `AccesoService` es el único chokepoint

**El acceso se resuelve por pertenencia al proyecto, no por rol.** Tener rol `ASESOR` no habilita a tocar un proyecto ajeno. El coordinador es la excepción: lee todo, no escribe nada.

El flujo de cada request protegida es siempre el mismo:

1. `JwtAuthFilter` parsea el `Bearer`, arma un `UsernamePasswordAuthenticationToken` con el email como principal y `ROLE_<rol>` como authority. Token inválido → corta con 401 JSON ahí mismo (si dejara seguir, Spring devolvería un 403 HTML que rompe el contrato de la API).
2. El controller recibe `Authentication` como parámetro y lo pasa **entero** al service. Los controllers no tienen lógica.
3. El service llama a `AccesoService.usuarioActual(authentication)` y después a `verificarLectura` / `verificarAsesorDelProyecto` / `verificarEstudianteDelProyecto`.

Al agregar un endpoint, seguí ese patrón: la verificación va en el service vía `AccesoService`, no con `@PreAuthorize` ni chequeos de rol sueltos en el controller.

`SecurityConfig` deja públicos solo `/api/auth/**`, `/api/health` y `/error` (este último a propósito: corre en otro dispatch donde `JwtAuthFilter` no actúa, y protegerlo convierte cualquier error del servidor en un 401 engañoso).

Los `RequestMapping` no son uniformes: `ProyectoController` mapea `/api/proyectos`, pero los controllers de recursos anidados (`HitoController`, `EntregaController`, …) mapean `/api` y declaran la ruta completa por método, porque atienden tanto `/proyectos/{id}/hitos` como `/hitos/{id}`.

### Frontend: una sola puerta al backend

`src/api/client.js` es el único lugar que hace `fetch`. Adjunta el token de `localStorage`, y ante un 401 dispara el handler global registrado por `AuthContext` → cierre de sesión automático. `src/api/tesistrack.js` envuelve los endpoints; las páginas no llaman a `api()` directo.

`AuthContext` no confía en `localStorage`: al montar revalida el token contra `GET /api/auth/me` y expone `verificando` mientras tanto. Las guardas de ruta (`RutaPrivada`, `RutaPublica`, `Portada` en `App.jsx`) esperan a que `verificando` sea falso antes de redirigir — si agregás una guarda nueva, tiene que hacer lo mismo o va a mandar al login a usuarios con sesión válida.

`useProyectoActivo` mantiene el proyecto seleccionado y lo persiste en `localStorage`: el estudiante suele tener uno, el asesor y el coordinador varios, y la elección se recuerda entre pantallas.

**El backend va más adelantado que la UI.** Varias rutas (`/entregas`, `/observaciones`, `/asesorias`, `/tareas`) todavía renderizan `PendientePage`, que lista los endpoints que ya existen y esperan pantalla. Antes de construir una de esas pantallas, mirá qué endpoints declara ese placeholder.

## Convenciones

- **React va fijado en 18.3.1 exacto** en `package.json`, sin `^` ni `~`. El profesor pidió React 18; un salto de mayor rompe código a mitad de proyecto. No lo "actualices" al agregar dependencias.
- **Java 17, no 21.** El JDK instalado es 17 y el `pom.xml` está fijado ahí.
- Paquetes del backend: `controller` / `service` / `repository` / `model` / `dto` / `config`, bajo `com.tesistrack`.
- DTOs como `record`, con un `from(...)` estático que mapea la entidad; entidades JPA en `model`, con `FetchType.LAZY` en los `@ManyToOne`.
- Errores de API salen por `ApiExceptionHandler` como JSON `{"error": "..."}` — 400 validación/duplicado/cuerpo ilegible, 401 credenciales, 403 `ForbiddenException`, 404 `NotFoundException`. Ambas excepciones viven en `config`.
- El rol `COORDINADOR` **no** es autoasignable en el registro.
- Nada de secretos hardcodeados: config sensible por variable de entorno con default de dev (`JWT_SECRET`, `DB_*`, `CORS_ALLOWED_ORIGINS`).
- Código y comentarios en español rioplatense, igual que el resto del repo.
- El CSS va por archivo en `src/styles/` (`app.css`, `auth.css`, `landing.css`, `brand.css`, `badge.css`), sin framework ni CSS-in-JS.

## Verificación

Compilar no alcanza. Para cambios que tocan la UI o el flujo end-to-end, levantá los tres servicios y comprobalo en un navegador real (Playwright está disponible) antes de darlo por hecho.
