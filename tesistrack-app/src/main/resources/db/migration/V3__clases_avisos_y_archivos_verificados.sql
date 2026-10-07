-- Fase 1.5: la clase como salon completo, asesorias privadas opcionales y
-- previsualizacion segura de archivos. No toca V1 ni V2.

-- ------------------------------------------------- asesorias privadas (opcional)

-- NULL = todavia no respondio la pregunta; TRUE/FALSE = su respuesta. Solo tiene
-- sentido para el rol ASESOR; en los demas queda NULL.
ALTER TABLE users ADD COLUMN asesorias_privadas BOOLEAN;

-- ------------------------------------------------- fecha de ingreso a la clase

-- Cuando el grupo entro a su clase. Se mantiene al asignar y al sacar el area.
-- Los grupos que ya estaban en una clase quedan con la fecha de su creacion,
-- que es lo mas cercano que se sabe.
ALTER TABLE proyecto ADD COLUMN area_desde TIMESTAMP WITH TIME ZONE;
UPDATE proyecto SET area_desde = created_at WHERE area_id IS NOT NULL;

-- ------------------------------------------------- avisos del tablon

-- Un aviso del profesor para toda la clase: texto simple, sin comentarios.
CREATE TABLE aviso (
    id         BIGSERIAL PRIMARY KEY,
    area_id    BIGINT NOT NULL REFERENCES area(id) ON DELETE CASCADE,
    texto      TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_aviso_area_fecha ON aviso(area_id, created_at DESC);

-- ------------------------------------------------- tipos de archivo verificados

-- Hasta ahora archivo_tipo guardaba lo que declaraba quien subia el archivo. Desde
-- esta version se guarda el tipo verificado por los bytes iniciales (firma) y todo
-- lo que no sea PNG, JPEG, GIF, WebP o PDF queda como application/octet-stream:
-- solo esos cinco se previsualizan, el resto se descarga. Esto aplica la misma
-- regla a lo que ya estaba subido, para que no haya archivos con un tipo declarado
-- (y mentido) conviviendo con los verificados.

UPDATE material m SET archivo_tipo = CASE
        WHEN substring(a.contenido from 1 for 8) = '\x89504e470d0a1a0a'::bytea THEN 'image/png'
        WHEN substring(a.contenido from 1 for 3) = '\xffd8ff'::bytea THEN 'image/jpeg'
        WHEN substring(a.contenido from 1 for 6) IN ('\x474946383761'::bytea, '\x474946383961'::bytea) THEN 'image/gif'
        WHEN substring(a.contenido from 1 for 4) = '\x52494646'::bytea
             AND substring(a.contenido from 9 for 4) = '\x57454250'::bytea THEN 'image/webp'
        WHEN substring(a.contenido from 1 for 5) = '\x255044462d'::bytea THEN 'application/pdf'
        ELSE 'application/octet-stream'
    END
FROM archivo_material a
WHERE a.material_id = m.id;

UPDATE entrega e SET archivo_tipo = CASE
        WHEN substring(a.contenido from 1 for 8) = '\x89504e470d0a1a0a'::bytea THEN 'image/png'
        WHEN substring(a.contenido from 1 for 3) = '\xffd8ff'::bytea THEN 'image/jpeg'
        WHEN substring(a.contenido from 1 for 6) IN ('\x474946383761'::bytea, '\x474946383961'::bytea) THEN 'image/gif'
        WHEN substring(a.contenido from 1 for 4) = '\x52494646'::bytea
             AND substring(a.contenido from 9 for 4) = '\x57454250'::bytea THEN 'image/webp'
        WHEN substring(a.contenido from 1 for 5) = '\x255044462d'::bytea THEN 'application/pdf'
        ELSE 'application/octet-stream'
    END
FROM archivo_entrega a
WHERE a.entrega_id = e.id;
