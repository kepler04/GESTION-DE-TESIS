---
title: Desarrollo
tags:
  - desarrollo
---

# Desarrollo

> [!success] Iniciado
> El desarrollo arrancó con el skeleton técnico funcionando end-to-end. Ojo: varias [[Decisiones pendientes]] siguen abiertas (hitos, coordinador) — lo construido hasta ahora es la base técnica (auth, infra), que no depende de esas decisiones.

## Repositorios

| Ruta | Qué es |
|---|---|
| `e:\CLAUDE\UTEC\tesistrack-app` | Backend — Spring Boot, API REST |
| `e:\CLAUDE\UTEC\tesistrack-web` | Frontend — React 18 + Vite |

Ambos son repos git independientes. En `e:\CLAUDE\UTEC\CLAUDE.md` está el contexto que se carga automáticamente al trabajar con Claude Code: comandos, convenciones y punteros a este vault.

Ver el stack completo y el porqué de cada decisión en [[Arquitectura]].

## Cómo levantar el proyecto

```
# Base de datos (desde tesistrack-app)
docker compose up -d          # PostgreSQL en :5432

# Backend (desde tesistrack-app) → :8080
./mvnw.cmd spring-boot:run

# Frontend (desde tesistrack-web) → :5173
npm run dev
```

## Avance

- [x] Skeleton backend Spring Boot + PostgreSQL en Docker
- [x] Skeleton frontend React 18 + Vite
- [x] Conexión backend ↔ frontend verificada en navegador
- [x] Login y registro con email + contraseña (JWT) — ver [[Arquitectura]]
- [ ] Modelo de datos completo (Entregable 1) — entidades Proyecto, Hito, Asesoría, Acuerdo, Tarea, Entrega, Observación
- [ ] Estilos de UI (las pantallas están sin diseño todavía)
- [ ] Login con Google (pendiente del OAuth Client ID)
- [ ] Pipeline CI/CD + despliegue (Entregable 4)

> [!warning] Bloqueante para el Entregable 1
> El modelo de datos no se puede cerrar sin resolver las decisiones sobre hitos: quién los crea, qué estados tienen, si son modificables, y cómo se relacionan con las entregas. Ver [[Decisiones pendientes]] y [[Hitos]].

## Ver también
- [[Arquitectura]]
- [[Base de datos]]
- [[Entregables y evaluación]]
