# Taller 2 — Evidencias de cumplimiento

Este apartado concentra las evidencias del Taller 2 sobre el backend de **TesisTrack**.
No duplica la implementación: cada criterio apunta al código real del proyecto para que su revisión sea directa.

## Resumen

| Criterio del taller | Evidencia principal | Estado |
|---|---|---|
| 1. APIs REST con GET, POST, PUT y DELETE | `AreaController`, `ProyectoController`, `HitoController` | Cumplido |
| 2. Lógica de pertenencia | `AccesoService` + servicios de recursos | Cumplido |
| 3. Autorización por roles | `SecurityConfig`, `AccesoService`, `AreaService`, `AsesoradoService` | Cumplido |
| 4. SQL versionado con Flyway | `db/migration/V1__create_initial_schema.sql` | Cumplido |
| 5. Validaciones de formulario | DTOs `*Request` + `@Valid` | Cumplido |
| 6. Lógica específica de negocio | `ProyectoService`, `EntregaService`, `TareaService`, `ActividadService` | Cumplido |
| 7. Anotaciones, MapStruct y Lombok | `UserMapper`, `Area`, anotaciones Spring/JPA/Validation | Cumplido |

---

## 1. APIs REST: GET, POST, PUT y DELETE

La API REST está organizada en controladores dentro de:

`tesistrack-app/src/main/java/com/tesistrack/controller/`

Un ejemplo compacto es `AreaController`:

- `POST /api/areas` — crea un área.
- `GET /api/areas` — lista las áreas del usuario autenticado.
- `PUT /api/areas/{id}` — renombra un área.
- `DELETE /api/areas/{id}` — elimina un área.

Otros recursos REST relevantes son proyectos, hitos, entregas, observaciones, asesorías, tareas y actividades.

## 2. Lógica de pertenencia

La pertenencia no se resuelve solo por rol. `AccesoService` verifica si el usuario autenticado pertenece al proyecto concreto.

Archivo principal:

`tesistrack-app/src/main/java/com/tesistrack/service/AccesoService.java`

Reglas principales:

- Un estudiante solo puede modificar proyectos en los que figura como integrante.
- Un asesor solo puede realizar acciones de asesor sobre proyectos que tiene asignados.
- Un coordinador puede consultar los proyectos según las reglas de lectura definidas.

Los servicios reutilizan estas verificaciones antes de operar sobre hitos, entregas, observaciones, asesorías y tareas.

## 3. Autorización por roles

TesisTrack utiliza los roles:

- `ESTUDIANTE`
- `ASESOR`
- `COORDINADOR`

Archivos principales:

- `model/Role.java`
- `config/SecurityConfig.java`
- `service/AccesoService.java`
- `service/AreaService.java`
- `service/AsesoradoService.java`

`SecurityConfig` exige autenticación mediante JWT para la API, salvo los endpoints públicos de autenticación y health check. Los servicios aplican posteriormente las reglas específicas de rol y pertenencia.

Ejemplos:

- Solo un estudiante puede crear un proyecto.
- Solo un asesor puede gestionar áreas.
- Solo el asesor asignado puede emitir determinadas acciones sobre una tesis.
- Solo el responsable de una tarea o el asesor correspondiente puede completarla.

## 4. SQL versionado con Flyway

Se incorporó Flyway para que la estructura de base de datos forme parte del versionado del proyecto.

Archivos:

- `tesistrack-app/pom.xml`
- `tesistrack-app/src/main/resources/application.properties`
- `tesistrack-app/src/main/resources/db/migration/V1__create_initial_schema.sql`

La migración inicial contiene el esquema de TesisTrack: usuarios, áreas, proyectos, integrantes de proyectos, actividades, hitos, entregas, archivos, observaciones, asesorías, acuerdos y tareas, además de claves foráneas e índices.

Para una base ya existente se utiliza `baseline-on-migrate`, evitando que Flyway intente recrear las tablas actuales. Para una base nueva, Flyway crea el esquema desde la migración versionada.

Hibernate queda configurado con:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

De este modo Hibernate valida el modelo JPA, mientras Flyway mantiene el versionado del esquema.

## 5. Validaciones de formulario

Los objetos de entrada utilizan Jakarta Bean Validation y los controladores aplican `@Valid`.

Ejemplos:

- `RegisterRequest`: `@NotBlank`, `@Email`, `@Size`, `@NotNull`, `@AssertTrue`.
- `AreaRequest`: `@NotBlank`, `@Size`.
- `CrearProyectoRequest`: `@NotBlank`.
- `HitoRequest`: `@NotBlank`.

Además, `ApiExceptionHandler` centraliza la respuesta ante errores de validación y otras excepciones de la API.

## 6. Lógica específica de negocio

El backend contiene reglas de negocio adicionales al CRUD. Algunos ejemplos son:

### ProyectoService

- Solo un estudiante puede crear una tesis.
- Una tesis grupal no puede quedarse sin ningún estudiante.
- Un código de invitación asigna asesor y área de manera conjunta.
- Al ingresar a un espacio se reparten las actividades vigentes al proyecto.

### EntregaService

- Las entregas se versionan automáticamente (`v1`, `v2`, etc.).
- Al registrar una entrega, el hito pasa a estado `ENTREGADO`.
- Los archivos tienen un límite de 15 MB.
- Solo los estudiantes del proyecto pueden subir documentos.

### TareaService

- Solo el responsable de una tarea o el asesor del proyecto puede completarla.

### ActividadService

- Una actividad de un área se distribuye como un hito para cada proyecto del espacio.
- Se evita duplicar el hito si un proyecto vuelve a ingresar al mismo espacio.

## 7. Anotaciones, MapStruct y Lombok

### Anotaciones

El proyecto utiliza anotaciones de Spring, JPA y Jakarta Validation, por ejemplo:

- `@RestController`, `@Service`, `@Configuration`
- `@Entity`, `@Table`, `@ManyToOne`, `@ManyToMany`
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`
- `@Valid`, `@NotBlank`, `@Email`, `@Size`

### MapStruct

Se incorporó:

`tesistrack-app/src/main/java/com/tesistrack/mapper/UserMapper.java`

Mapea `User` a `UserDto` y se utiliza en `AuthService` para las respuestas de registro y login. Esto mantiene fuera del DTO datos internos como `passwordHash`.

### Lombok

La entidad:

`tesistrack-app/src/main/java/com/tesistrack/model/Area.java`

utiliza `@Getter` y `@Setter` para reducir código repetitivo manteniendo intacto el modelo JPA.

---

## Verificación recomendada

Desde `tesistrack-app`:

```powershell
.\mvnw.cmd clean test
```

Luego levantar PostgreSQL:

```bash
docker compose up -d
```

Y ejecutar el backend:

```powershell
.\mvnw.cmd spring-boot:run
```

Para una revisión funcional del Taller 2 conviene comprobar, como mínimo:

1. Registro de un usuario y confirmación de que la respuesta no expone `passwordHash`.
2. CRUD de áreas con un usuario `ASESOR`.
3. Intento de gestionar un área con un usuario que no sea su propietario.
4. Creación y consulta de un proyecto verificando pertenencia.
5. Validación negativa de un request inválido.
6. Registro de una entrega y comprobación de versionado/estado.
7. Presencia de `flyway_schema_history` y aplicación de la migración en una base nueva.

## Alcance de este apartado

Este directorio es un **índice de evidencias del Taller 2**. El código funcional continúa en la estructura normal del backend; no se crearon copias paralelas de controladores, servicios o entidades únicamente para la entrega.
