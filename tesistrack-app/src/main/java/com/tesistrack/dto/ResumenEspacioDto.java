package com.tesistrack.dto;

/** Lo que borrar el espacio se lleva y lo que deja, para que el diálogo lo cuente en números. */
public record ResumenEspacioDto(
    long actividades,
    long tesis,
    long carpetas,
    long materiales,
    long archivos,
    long sesiones
) {
}
