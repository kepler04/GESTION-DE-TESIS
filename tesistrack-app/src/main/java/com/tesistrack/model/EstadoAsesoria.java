package com.tesistrack.model;

/**
 * Ciclo de una asesoría. Nace {@code PROGRAMADA} (con fecha y enlace) o
 * {@code REALIZADA} (se registra una reunión que ya ocurrió) y desde
 * {@code PROGRAMADA} pasa a {@code REALIZADA} o {@code CANCELADA}.
 *
 * <p>Solo una asesoría {@code REALIZADA} admite acuerdos: no se puede acordar nada
 * en una reunión que no se hizo.
 */
public enum EstadoAsesoria {
    PROGRAMADA,
    REALIZADA,
    CANCELADA
}
