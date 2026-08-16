package com.tesistrack.model;

/**
 * Estado de una <b>versión</b> concreta, pedido por el Entregable 0 ("estado de la
 * entrega").
 *
 * <p>No duplica a {@link EstadoHito}: el hito dice en qué anda el trabajo <i>hoy</i>,
 * y esto queda como el veredicto de cada versión. Sirve para responder "¿cuál fue la
 * versión que el asesor aprobó?" sin tener que reconstruirlo desde las
 * observaciones.
 */
public enum EstadoEntrega {

    /** Recién subida: el asesor todavía no se pronunció. */
    EN_REVISION,

    /** El asesor le registró al menos una observación. */
    OBSERVADA,

    /** El asesor la dio por buena. */
    APROBADA
}
