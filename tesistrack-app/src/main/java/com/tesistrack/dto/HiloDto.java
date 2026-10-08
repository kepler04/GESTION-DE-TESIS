package com.tesistrack.dto;

import java.util.List;

/** Una conversación abierta: con quién, si se le puede escribir y los mensajes, del más viejo al más nuevo. */
public record HiloDto(ContactoDto contacto, boolean puedeEscribir, List<MensajeDto> mensajes) {
}
