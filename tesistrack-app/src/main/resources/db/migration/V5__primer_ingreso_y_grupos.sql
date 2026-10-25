-- Fase 2: la experiencia del estudiante (Decisiones 29 a 31).

-- Cuántos integrantes admite un grupo de la clase. Lo configura el profesor; por
-- defecto 3. Bajarlo no expulsa a nadie: solo impide sumar más.
ALTER TABLE area ADD COLUMN tope_grupo INTEGER NOT NULL DEFAULT 3;
ALTER TABLE area ADD CONSTRAINT ck_area_tope_grupo CHECK (tope_grupo BETWEEN 1 AND 10);

-- El tema puede quedar "por definir": NULL, no un texto vacío ni un marcador.
ALTER TABLE proyecto ALTER COLUMN titulo DROP NOT NULL;
UPDATE proyecto SET titulo = NULL WHERE btrim(titulo) = '';

-- Un grupo abierto acepta compañeros (los ve quien entra con el código de la clase);
-- una tesis individual no. Las que ya tienen más de un integrante son grupos.
ALTER TABLE proyecto ADD COLUMN grupal BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE proyecto p SET grupal = TRUE
WHERE (SELECT count(*) FROM proyecto_estudiante pe WHERE pe.proyecto_id = p.id) > 1;

-- Invitaciones pendientes a sumarse a un grupo. Aceptada o rechazada, la fila se
-- borra: lo que queda registrado es la pertenencia al grupo, no el trámite.
CREATE TABLE invitacion_grupo (
    id           BIGSERIAL PRIMARY KEY,
    proyecto_id  BIGINT NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE,
    invitado_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitador_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_invitacion_grupo UNIQUE (proyecto_id, invitado_id)
);

CREATE INDEX idx_invitacion_grupo_invitado ON invitacion_grupo (invitado_id);
