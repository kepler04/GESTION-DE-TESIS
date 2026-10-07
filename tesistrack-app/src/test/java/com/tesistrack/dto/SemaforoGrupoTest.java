package com.tesistrack.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.Hito;

/** Las reglas del semáforo del grupo (Decisión 26). */
class SemaforoGrupoTest {

    private static final LocalDate HOY = LocalDate.of(2026, 10, 7);

    private static Hito hito(EstadoHito estado, LocalDate fechaLimite) {
        Hito hito = new Hito();
        hito.setNombre("Hito");
        hito.setEstado(estado);
        hito.setFechaLimite(fechaLimite);
        return hito;
    }

    @Test
    void sinHitosNoEmpezo() {
        assertThat(SemaforoGrupo.de(List.of(), HOY)).isEqualTo(SemaforoGrupo.SIN_ACTIVIDAD);
    }

    @Test
    void unHitoVencidoSinEntregarLoAtrasa() {
        var hitos = List.of(
            hito(EstadoHito.COMPLETADO, HOY.minusDays(10)),
            hito(EstadoHito.PENDIENTE, HOY.minusDays(1)));
        assertThat(SemaforoGrupo.de(hitos, HOY)).isEqualTo(SemaforoGrupo.ROJO);
    }

    @Test
    void elAtrasoPesaMasQueElRiesgo() {
        var hitos = List.of(
            hito(EstadoHito.OBSERVADO, HOY.minusDays(5)),
            hito(EstadoHito.EN_PROCESO, HOY.minusDays(2)));
        assertThat(SemaforoGrupo.de(hitos, HOY)).isEqualTo(SemaforoGrupo.ROJO);
    }

    @Test
    void observacionesSinSubsanarLoPonenEnRiesgo() {
        var hitos = List.of(hito(EstadoHito.OBSERVADO, HOY.plusDays(20)));
        assertThat(SemaforoGrupo.de(hitos, HOY)).isEqualTo(SemaforoGrupo.AMARILLO);
    }

    @Test
    void unHitoQueVenceProntoSinEntregarLoPoneEnRiesgo() {
        assertThat(SemaforoGrupo.de(List.of(hito(EstadoHito.PENDIENTE, HOY)), HOY))
            .isEqualTo(SemaforoGrupo.AMARILLO);
        assertThat(SemaforoGrupo.de(List.of(hito(EstadoHito.EN_PROCESO, HOY.plusDays(3))), HOY))
            .isEqualTo(SemaforoGrupo.AMARILLO);
    }

    @Test
    void unHitoQueVenceMasAdelanteNoEsRiesgo() {
        assertThat(SemaforoGrupo.de(List.of(hito(EstadoHito.PENDIENTE, HOY.plusDays(4))), HOY))
            .isEqualTo(SemaforoGrupo.VERDE);
        assertThat(SemaforoGrupo.de(List.of(hito(EstadoHito.PENDIENTE, null)), HOY))
            .isEqualTo(SemaforoGrupo.VERDE);
    }

    @Test
    void entregarATiempoDejaAlGrupoAlDiaAunqueFalteLaRevision() {
        // Antes quedaba amarillo ("por atender"): el turno era del profesor, no del grupo.
        var hitos = List.of(hito(EstadoHito.ENTREGADO, HOY.plusDays(1)));
        assertThat(SemaforoGrupo.de(hitos, HOY)).isEqualTo(SemaforoGrupo.VERDE);
    }
}
