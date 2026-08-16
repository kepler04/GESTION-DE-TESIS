package com.tesistrack.dto;

import java.time.LocalDate;

import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.Hito;

/**
 * Lectura de un vistazo del estado de un estudiante en una actividad.
 *
 * <p>No reemplaza a {@link EstadoHito}: lo traduce. El estado dice qué pasó; el
 * semáforo dice <i>de quién es el turno</i>, que es lo que el asesor mira cuando
 * abre el tablero con veinte asesorados.
 *
 * <p>{@link #EN_FALTA} es el único que no sale del estado sino de la fecha: un hito
 * puede estar {@code PENDIENTE} y estar perfecto, o estar vencido.
 */
public enum Semaforo {

    /** Cerrado: el asesor lo dio por completado. */
    LISTO,

    /** El estudiante entregó y espera al asesor. */
    POR_REVISAR,

    /** El asesor observó y espera la corrección del estudiante. */
    OBSERVADO,

    /** Venció la fecha y no hay entrega. */
    EN_FALTA,

    /** Todavía en plazo, sin entregar. */
    PENDIENTE,

    /** El estudiante entró al área después de que se borrara la actividad. */
    SIN_ASIGNAR;

    public static Semaforo de(Hito hito, LocalDate hoy) {
        if (hito == null) {
            return SIN_ASIGNAR;
        }
        return switch (hito.getEstado()) {
            case COMPLETADO -> LISTO;
            case ENTREGADO -> POR_REVISAR;
            case OBSERVADO -> OBSERVADO;
            case PENDIENTE, EN_PROCESO -> vencido(hito, hoy) ? EN_FALTA : PENDIENTE;
        };
    }

    private static boolean vencido(Hito hito, LocalDate hoy) {
        return hito.getFechaLimite() != null && hito.getFechaLimite().isBefore(hoy);
    }
}
