package com.tesistrack.dto;

import java.time.Instant;

import com.tesistrack.model.Material;

/** Nunca lleva los bytes: solo los metadatos. La descarga va por su propio endpoint. */
public record MaterialDto(
    Long id,
    Long carpetaId,
    String titulo,
    String url,
    boolean esArchivo,
    String archivoNombre,
    String archivoTipo,
    Long archivoTamano,
    Instant createdAt
) {

    public static MaterialDto from(Material material) {
        return new MaterialDto(
            material.getId(),
            material.getCarpeta().getId(),
            material.getTitulo(),
            material.getUrl(),
            material.esArchivo(),
            material.getArchivoNombre(),
            material.getArchivoTipo(),
            material.getArchivoTamano(),
            material.getCreatedAt());
    }
}
