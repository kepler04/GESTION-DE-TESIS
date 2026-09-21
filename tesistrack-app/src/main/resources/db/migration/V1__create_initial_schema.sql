-- TesisTrack - esquema inicial versionado con Flyway.
-- En una base nueva esta migracion crea todo el esquema.
-- En una base ya existente, baseline-on-migrate evita recrear las tablas.

CREATE TABLE users (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(255) NOT NULL,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    password_hash         VARCHAR(255) NOT NULL,
    role                  VARCHAR(255) NOT NULL,
    telefono              VARCHAR(40),
    ubicacion             VARCHAR(120),
    carrera               VARCHAR(120),
    organizacion          VARCHAR(160),
    politica_version      VARCHAR(20),
    politica_aceptada_at  TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE area (
    id             BIGSERIAL PRIMARY KEY,
    nombre         VARCHAR(80) NOT NULL,
    codigo         VARCHAR(12) NOT NULL UNIQUE,
    propietario_id BIGINT NOT NULL REFERENCES users(id),
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_area_propietario_nombre UNIQUE (propietario_id, nombre)
);

CREATE TABLE proyecto (
    id           BIGSERIAL PRIMARY KEY,
    titulo       VARCHAR(255) NOT NULL,
    descripcion  TEXT,
    estado       VARCHAR(20) NOT NULL,
    asesor_id    BIGINT REFERENCES users(id),
    fecha_inicio DATE,
    area_id      BIGINT REFERENCES area(id),
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE proyecto_estudiante (
    proyecto_id   BIGINT NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    estudiante_id BIGINT NOT NULL REFERENCES users(id),
    PRIMARY KEY (proyecto_id, estudiante_id)
);

CREATE TABLE actividad (
    id           BIGSERIAL PRIMARY KEY,
    area_id      BIGINT NOT NULL REFERENCES area(id),
    nombre       VARCHAR(255) NOT NULL,
    descripcion  TEXT,
    fecha_limite DATE,
    orden        INTEGER NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE hito (
    id           BIGSERIAL PRIMARY KEY,
    proyecto_id  BIGINT NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    actividad_id BIGINT REFERENCES actividad(id),
    nombre       VARCHAR(255) NOT NULL,
    descripcion  TEXT,
    fecha_limite DATE,
    estado       VARCHAR(20) NOT NULL,
    orden        INTEGER NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE entrega (
    id               BIGSERIAL PRIMARY KEY,
    hito_id          BIGINT NOT NULL REFERENCES hito(id) ON DELETE CASCADE,
    version          INTEGER NOT NULL,
    archivo_nombre   VARCHAR(255),
    archivo_url      VARCHAR(500),
    archivo_tipo     VARCHAR(120),
    archivo_tamano   BIGINT,
    estado           VARCHAR(20) NOT NULL,
    comentario       TEXT,
    entregada_por_id BIGINT NOT NULL REFERENCES users(id),
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_entrega_hito_version UNIQUE (hito_id, version)
);

CREATE TABLE archivo_entrega (
    id         BIGSERIAL PRIMARY KEY,
    entrega_id BIGINT NOT NULL UNIQUE REFERENCES entrega(id),
    contenido  BYTEA NOT NULL
);

CREATE TABLE observacion (
    id                BIGSERIAL PRIMARY KEY,
    entrega_id        BIGINT NOT NULL REFERENCES entrega(id) ON DELETE CASCADE,
    descripcion       TEXT NOT NULL,
    estado            VARCHAR(20) NOT NULL,
    registrada_por_id BIGINT NOT NULL REFERENCES users(id),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE asesoria (
    id                BIGSERIAL PRIMARY KEY,
    proyecto_id       BIGINT NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    fecha             TIMESTAMP WITH TIME ZONE NOT NULL,
    tema              VARCHAR(255) NOT NULL,
    resumen           TEXT,
    registrada_por_id BIGINT NOT NULL REFERENCES users(id),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE acuerdo (
    id          BIGSERIAL PRIMARY KEY,
    asesoria_id BIGINT NOT NULL REFERENCES asesoria(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE tarea (
    id             BIGSERIAL PRIMARY KEY,
    proyecto_id    BIGINT NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    acuerdo_id     BIGINT REFERENCES acuerdo(id) ON DELETE SET NULL,
    descripcion    TEXT NOT NULL,
    responsable_id BIGINT REFERENCES users(id),
    fecha_limite   DATE,
    completada     BOOLEAN NOT NULL,
    completada_at  TIMESTAMP WITH TIME ZONE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_area_propietario ON area(propietario_id);
CREATE INDEX idx_actividad_area ON actividad(area_id);
CREATE INDEX idx_proyecto_estudiante_estudiante ON proyecto_estudiante(estudiante_id);
CREATE INDEX idx_proyecto_asesor ON proyecto(asesor_id);
CREATE INDEX idx_proyecto_area ON proyecto(area_id);
CREATE INDEX idx_hito_proyecto ON hito(proyecto_id);
CREATE INDEX idx_hito_actividad ON hito(actividad_id);
CREATE INDEX idx_entrega_hito ON entrega(hito_id);
CREATE INDEX idx_observacion_entrega ON observacion(entrega_id);
CREATE INDEX idx_asesoria_proyecto ON asesoria(proyecto_id);
CREATE INDEX idx_acuerdo_asesoria ON acuerdo(asesoria_id);
CREATE INDEX idx_tarea_proyecto ON tarea(proyecto_id);
CREATE INDEX idx_tarea_responsable ON tarea(responsable_id);
