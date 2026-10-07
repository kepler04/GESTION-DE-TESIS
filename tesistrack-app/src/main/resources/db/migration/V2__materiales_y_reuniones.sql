-- Fase 1: el espacio como aula. Materiales en carpetas y reuniones con enlace.
-- No toca V1: Flyway guarda el checksum de lo ya aplicado.

-- ---------------------------------------------------------------- materiales

-- Carpetas del espacio (Temas de tesis, Rubrica, Clases...). Las arma el asesor.
CREATE TABLE carpeta_material (
    id         BIGSERIAL PRIMARY KEY,
    area_id    BIGINT NOT NULL REFERENCES area(id) ON DELETE CASCADE,
    nombre     VARCHAR(80) NOT NULL,
    orden      INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_carpeta_area_nombre UNIQUE (area_id, nombre)
);

-- Un material es un enlace o un archivo, nunca ambos ni ninguno. Los metadatos del
-- archivo viven aca (baratos, se muestran siempre) y los bytes en archivo_material.
CREATE TABLE material (
    id             BIGSERIAL PRIMARY KEY,
    carpeta_id     BIGINT NOT NULL REFERENCES carpeta_material(id) ON DELETE CASCADE,
    titulo         VARCHAR(160) NOT NULL,
    url            VARCHAR(1000),
    archivo_nombre VARCHAR(255),
    archivo_tipo   VARCHAR(120),
    archivo_tamano BIGINT,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT ck_material_enlace_o_archivo CHECK ((url IS NOT NULL) <> (archivo_nombre IS NOT NULL)),
    CONSTRAINT ck_material_url_https CHECK (url IS NULL OR url ~ '^https://')
);

-- Los bytes, aparte (mismo criterio que archivo_entrega): listar los materiales
-- de una carpeta nunca arrastra los archivos a memoria. bytea, no oid.
CREATE TABLE archivo_material (
    id          BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL UNIQUE REFERENCES material(id) ON DELETE CASCADE,
    contenido   BYTEA NOT NULL
);

-- Carpetas sugeridas para los espacios que ya existian. Los nuevos las reciben al
-- crearse (CarpetaService). Se pueden renombrar o borrar como cualquier otra.
INSERT INTO carpeta_material (area_id, nombre, orden, created_at)
SELECT a.id, c.nombre, c.orden, now()
FROM area a
CROSS JOIN (VALUES ('Temas de tesis', 1), ('Rúbrica', 2), ('Clases', 3)) AS c(nombre, orden);

-- ---------------------------------------------------------------- reuniones

-- Clase para todo el espacio: fecha y hora, titulo y el enlace que pega el asesor.
CREATE TABLE sesion_espacio (
    id         BIGSERIAL PRIMARY KEY,
    area_id    BIGINT NOT NULL REFERENCES area(id) ON DELETE CASCADE,
    titulo     VARCHAR(160) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    enlace     VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT ck_sesion_enlace_https CHECK (enlace ~ '^https://')
);

-- Las asesorias que ya existen eran reuniones registradas despues de ocurrir:
-- quedan REALIZADA. Las nuevas pueden nacer PROGRAMADA, con enlace.
ALTER TABLE asesoria
    ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'REALIZADA',
    ADD COLUMN enlace VARCHAR(1000);

ALTER TABLE asesoria
    ADD CONSTRAINT ck_asesoria_estado CHECK (estado IN ('PROGRAMADA', 'REALIZADA', 'CANCELADA')),
    ADD CONSTRAINT ck_asesoria_enlace_https CHECK (enlace IS NULL OR enlace ~ '^https://');

CREATE INDEX idx_carpeta_area ON carpeta_material(area_id);
CREATE INDEX idx_material_carpeta ON material(carpeta_id);
CREATE INDEX idx_sesion_area_fecha ON sesion_espacio(area_id, fecha_hora);
CREATE INDEX idx_asesoria_estado_fecha ON asesoria(estado, fecha);
