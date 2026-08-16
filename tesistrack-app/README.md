# TesisTrack

Plataforma web para el seguimiento de asesorías de tesis. Ver contexto completo del proyecto en el vault de Obsidian (`Entregables y evaluación`, `Arquitectura`, `Reglas de negocio`).

## Stack

- Java 17 + Spring Boot 4 (monolito)
- Thymeleaf (frontend server-rendered)
- Spring Data JPA + Hibernate
- PostgreSQL
- Spring Security
- Maven

## Requisitos

- JDK 17
- Docker (para levantar PostgreSQL local con `docker-compose`)

## Cómo correr en local

1. Levantar la base de datos:
   ```
   docker compose up -d
   ```
2. Correr la aplicación:
   ```
   ./mvnw.cmd spring-boot:run
   ```
3. Abrir http://localhost:8080

La configuración de conexión a la base de datos está en `src/main/resources/application.properties`, con defaults que matchean el `docker-compose.yml` (usuario/clave `tesistrack`, base `tesistrack`). Se pueden sobreescribir con las variables de entorno `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

## Estructura de paquetes

```
com.tesistrack
├── controller   # Controllers Spring MVC (Thymeleaf)
├── service      # Lógica de negocio
├── repository   # Spring Data JPA repositories
├── model        # Entidades JPA
└── config       # Configuración (Security, etc.)
```
