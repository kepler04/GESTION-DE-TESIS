package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Entrega;
import com.tesistrack.model.EstadoEntrega;

public record EntregaDto(
    Long id,
    Long hitoId,
    Integer version,
    String archivoNombre,
    String archivoUrl,
    String archivoTipo,
    Long archivoTamano,
    /** Si hay documento cargado en la plataforma; los bytes se piden aparte. */
    boolean tieneArchivo,
    EstadoEntrega estado,
    String comentario,
    UserDto entregadaPor,
    Instant createdAt
) {

    public static EntregaDto from(Entrega entrega) {
        return new EntregaDto(
            entrega.getId(),
            entrega.getHito().getId(),
            entrega.getVersion(),
            entrega.getArchivoNombre(),
            entrega.getArchivoUrl(),
            entrega.getArchivoTipo(),
            entrega.getArchivoTamano(),
            // El tamaño solo se completa al guardar el binario, así que sirve de
            // marca sin tener que consultar la tabla del archivo.
            entrega.getArchivoTamano() != null,
            entrega.getEstado(),
            entrega.getComentario(),
            UserDto.from(entrega.getEntregadaPor()),
            entrega.getCreatedAt());
    }
}
