package com.tesistrack.dto;

import java.time.LocalDate;
import java.util.List;

import com.tesistrack.model.Hito;

/**
 * El estado de un grupo entero de un vistazo, resumiendo todos sus hitos.
 *
 * <p>El {@link Semaforo} describe <b>un</b> hito (y es lo que muestra el tablero,
 * celda por celda); este describe al grupo, que es lo que el profesor mira en la
 * lista de personas y en el resumen de cada clase. Se arma con las mismas reglas
 * para que ningún grupo aparezca en rojo acá y al día en el tablero.
 */
public enum SemaforoGrupo {
    /** Atrasado: tiene algún hito vencido sin entregar. */
    ROJO,
    /** Hay movimiento por atender: algo esperando revisión o con observaciones por corregir. */
    AMARILLO,
    /** Al día: lo que venció está entregado o cerrado y no queda nada pendiente de revisar. */
    VERDE,
    /** Todavía no tiene ningún hito, así que no hay nada que evaluar. */
    SIN_ACTIVIDAD;

    public static SemaforoGrupo de(List<Hito> hitos, LocalDate hoy) {
        if (hitos.isEmpty()) {
            return SIN_ACTIVIDAD;
        }
        boolean hayMovimiento = false;
        for (Hito hito : hitos) {
            Semaforo semaforo = Semaforo.de(hito, hoy);
            if (semaforo == Semaforo.EN_FALTA) {
                return ROJO;
            }
            if (semaforo == Semaforo.POR_REVISAR || semaforo == Semaforo.OBSERVADO) {
                hayMovimiento = true;
            }
        }
        return hayMovimiento ? AMARILLO : VERDE;
    }
}
