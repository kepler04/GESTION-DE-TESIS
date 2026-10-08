package com.tesistrack.dto;

import java.time.Instant;

/**
 * Una fila de la bandeja: con quién, el último mensaje y cuántos sin leer.
 * {@code puedeEscribir} es falso cuando ya no comparten tesis ni clase: el historial
 * se conserva, pero la conversación queda de solo lectura.
 */
public record ConversacionDto(
    ContactoDto contacto,
    String ultimoTexto,
    Instant ultimoFecha,
    boolean ultimoPropio,
    long noLeidos,
    boolean puedeEscribir) {
}
