---
title: Desarrollo
tags:
  - desarrollo
---

# Desarrollo

> [!success] Entregables 1 y 2 cerrados; el 3 en curso
> Las 8 [[Decisiones pendientes]] están resueltas, así que ya no hay nada bloqueando el desarrollo. El modelo de datos y la API están terminados y verificados; falta completar las pantallas del panel.

## Repositorio

**Monorepo** → https://github.com/kepler04/GESTION-DE-TESIS

| Carpeta | Qué es |
|---|---|
| `tesistrack-app/` | Backend — Spring Boot 4, API REST, PostgreSQL |
| `tesistrack-web/` | Frontend — React 18.3.1 + Vite |
| `TesisTrack/` | Copia versionada de este vault |

> [!warning] El vault se edita en `E:\GENERAL\TesisTrack`
> La carpeta `TesisTrack/` del repo es una **copia**. Se sincroniza antes de commitear con
> `robocopy "E:\GENERAL\TesisTrack" "e:\CLAUDE\UTEC\TesisTrack" /MIR`.
> Si editás la copia directamente, el próximo sync la pisa.

En `e:\CLAUDE\UTEC\CLAUDE.md` está el contexto que se carga al trabajar con Claude Code. Ver el stack y el porqué de cada decisión en [[Arquitectura]].

## Cómo levantar el proyecto

```
# Base de datos (desde tesistrack-app)
docker compose up -d          # PostgreSQL en :5432

# Backend (desde tesistrack-app) → :8080
./mvnw.cmd spring-boot:run

# Frontend (desde tesistrack-web) → :5173
npm run dev
```

> [!important] El frontend tiene que quedar en el puerto 5173
> El backend solo acepta CORS desde `http://localhost:5173` (`cors.allowed-origins`). Si Vite avisa "Port 5173 is in use" y salta a otro puerto, el login falla por CORS: matá el proceso viejo en vez de dejarlo cambiar de puerto.

### Usuarios de prueba

Cargados a mano en la base local, no vienen con el repo.

| Rol | Email | Contraseña |
|---|---|---|
| Estudiante | `prueba@tesistrack.com` | `password123` |
| Asesor | `asesor@tesistrack.com` | `password123` |

## Avance

**Entregable 1 — Modelo de datos** ✅
- [x] Las 4 decisiones que bloqueaban el esquema (1, 3, 5, 6)
- [x] Diagrama ER y esquema SQL — ver [[Base de datos]]
- [x] 7 entidades JPA + repositorios sobre el `User` que ya existía
- [x] Verificado contra PostgreSQL real: 8 tablas, 13 claves foráneas y el `UNIQUE (hito_id, version)`

**Entregable 2 — Backend** ✅
- [x] Las 4 decisiones de permisos (2, 4, 7, 8)
- [x] 25 endpoints REST documentados en [[API]]
- [x] Autorización por pertenencia al proyecto, no solo por rol
- [x] 31 pruebas end-to-end recorriendo el flujo de [[Reglas de negocio]] y cada regla de permiso

**Entregable 3 — Aplicación full-stack** 🔨 en curso
- [x] Login y registro con JWT, con diseño propio
- [x] React Router + `AuthContext` + rutas protegidas
- [x] Panel con barra lateral; el menú se arma según el rol
- [x] Dashboard, Proyectos e Hitos consumiendo la API
- [ ] Pantallas de Entregas, Observaciones, Asesorías y Tareas (los endpoints ya funcionan; falta la interfaz)
- [ ] Subida real de archivos — falta decidir S3 vs. filesystem, ver [[Arquitectura#Por definir]]

**Entregable 4 — CI/CD y despliegue** ⬜
- [ ] Pipeline de GitHub Actions
- [ ] Backend en AWS, frontend en Vercel (con root directory en las subcarpetas)
- [ ] `JWT_SECRET` real por variable de entorno en producción

**Fuera de alcance por ahora**
- [ ] Login con Google — pendiente del OAuth Client ID
- [ ] Recuperación de contraseña — el botón está en la UI pero deshabilitado

## Cosas que conviene recordar

- **El logo** va en `tesistrack-web/public/marca/` (`logo.png` y `logo-blanco.png`). Hay un `LEEME.md` ahí con las instrucciones.
- **Los badges de estado llevan siempre ícono + texto.** No es capricho: `OBSERVADO` y `COMPLETADO` son casi indistinguibles en deuteranopía. Ver [[Arquitectura#Color de los estados]].
- **React va fijado en 18.3.1 exacto**, sin `^` ni `~`, igual que React Router. No lo actualices al agregar dependencias.

## Ver también
- [[Arquitectura]]
- [[Base de datos]]
- [[API]]
- [[Entregables y evaluación]]
