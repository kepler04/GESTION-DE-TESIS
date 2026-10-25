package com.tesistrack.dto;

/** Un compañero de la clase al que se puede invitar al grupo; {@code invitado} si ya tiene una invitación pendiente. */
public record CandidatoDto(Long id, String nombre, boolean invitado) {
}
