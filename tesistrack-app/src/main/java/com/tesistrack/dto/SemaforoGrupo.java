package com.tesistrack.dto;

import java.time.LocalDate;
import java.util.List;

import com.tesistrack.model.Hito;

/**
 * El estado de un grupo entero de un vistazo, resumiendo todos sus hitos.
 *
 * <p>El {@link Semaforo} describe <b>un</b> hito (y es lo que muestra el tablero,
 * celda por celda); este describe al grupo, que es lo que el profesor mira en la
 * lista de personas y en el resumen de cada clase, y lo que el estudiante ve de su
 * propia tesis. Se arma con las mismas reglas para que ningún grupo aparezca en rojo
 * acá y al día en el tablero.
 *
 * <p>Responde "¿este grupo va bien?", no "¿de quién es el turno?" (Decisión 26): una
 * entrega que espera al profesor no pone al grupo en riesgo, porque el grupo ya hizo
 * su parte. Un grupo <b>sin tema</b> tampoco cambia de color: el primer ingreso le
 * dice que puede definirlo después, y el profesor lo ve aparte, en "Necesitan
 * atención".
 */
public enum SemaforoGrupo {
    /** Atrasado: tiene algún hito vencido sin entregar. */
    ROJO,
    /** En riesgo: tiene observaciones sin subsanar, o un hito que vence pronto sin entrega. */
    AMARILLO,
    /** Al día: no debe nada vencido ni observado, y nada le vence en los próximos días. */
    VERDE,
    /** Sin empezar: todavía no tiene ningún hito, así que no hay nada que evaluar. */
    SIN_ACTIVIDAD;

    /** Cuántos días antes de la fecha límite un hito sin entregar pone al grupo en riesgo. */
    public static final int DIAS_DE_RIESGO = 3;

    public static SemaforoGrupo de(List<Hito> hitos, LocalDate hoy) {
        if (hitos.isEmpty()) {
            return SIN_ACTIVIDAD;
        }
        boolean enRiesgo = false;
        for (Hito hito : hitos) {
            Semaforo semaforo = Semaforo.de(hito, hoy);
            if (semaforo == Semaforo.EN_FALTA) {
                return ROJO;
            }
            if (semaforo == Semaforo.OBSERVADO || venceProntoSinEntregar(hito, hoy)) {
                enRiesgo = true;
            }
        }
        return enRiesgo ? AMARILLO : VERDE;
    }

    /**
     * Un hito todavía en plazo y sin entregar cuya fecha límite cae dentro de los
     * próximos {@link #DIAS_DE_RIESGO} días (hoy incluido).
     */
    public static boolean venceProntoSinEntregar(Hito hito, LocalDate hoy) {
        return Semaforo.de(hito, hoy) == Semaforo.PENDIENTE
            && hito.getFechaLimite() != null
            && !hito.getFechaLimite().isAfter(hoy.plusDays(DIAS_DE_RIESGO));
    }
}
