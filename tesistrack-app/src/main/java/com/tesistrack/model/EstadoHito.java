package com.tesistrack.model;

/**
 * Estados de un hito. El retorno OBSERVADO -> ENTREGADO ocurre cuando el
 * estudiante sube una nueva versión corrigiendo las observaciones.
 */
public enum EstadoHito {
    PENDIENTE,
    EN_PROCESO,
    ENTREGADO,
    OBSERVADO,
    COMPLETADO
}
