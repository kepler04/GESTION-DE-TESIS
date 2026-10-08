package com.tesistrack.dto;

import com.tesistrack.model.Role;

/**
 * Alguien a quien se le puede escribir. {@code relacion} dice por qué ("Tu profesor",
 * "Compañero de grupo", "Alumno · Taller de Tesis I"): es lo que habilita la
 * conversación. No lleva el correo: para escribirse no hace falta.
 */
public record ContactoDto(Long id, String nombre, Role rol, String relacion) {
}
