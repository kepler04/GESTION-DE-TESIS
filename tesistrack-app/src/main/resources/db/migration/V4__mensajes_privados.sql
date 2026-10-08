-- Mensajes privados uno a uno entre un profesor y sus alumnos, y entre compañeros de
-- un mismo grupo (Decisión 28). Quién puede escribirle a quién lo decide el backend
-- con la relación vigente (la tesis compartida); la tabla solo guarda el mensaje.

CREATE TABLE mensaje (
    id              BIGSERIAL PRIMARY KEY,
    remitente_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destinatario_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    texto           TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    -- null mientras el destinatario no abrió la conversación
    leido_at        TIMESTAMP WITH TIME ZONE,
    CONSTRAINT ck_mensaje_no_a_si_mismo CHECK (remitente_id <> destinatario_id),
    CONSTRAINT ck_mensaje_texto CHECK (char_length(btrim(texto)) BETWEEN 1 AND 2000)
);

-- Una conversación se lee en los dos sentidos (A→B y B→A): con este índice cada
-- sentido es un rango ordenado por fecha.
CREATE INDEX idx_mensaje_par_fecha ON mensaje (remitente_id, destinatario_id, created_at);

-- El contador de "no leídos" del menú se consulta en cada pantalla.
CREATE INDEX idx_mensaje_no_leidos ON mensaje (destinatario_id) WHERE leido_at IS NULL;
