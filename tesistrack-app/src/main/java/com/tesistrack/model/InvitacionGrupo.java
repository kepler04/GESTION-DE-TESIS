package com.tesistrack.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Una invitación pendiente a sumarse a un grupo de la clase (Decisión 31). La manda
 * un integrante del grupo a un compañero de la misma clase que trabaja solo; el
 * invitado la acepta o la rechaza. En los dos casos la fila se borra.
 */
@Entity
@Table(name = "invitacion_grupo")
@Getter
@Setter
public class InvitacionGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitado_id", nullable = false)
    private User invitado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitador_id", nullable = false)
    private User invitador;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
