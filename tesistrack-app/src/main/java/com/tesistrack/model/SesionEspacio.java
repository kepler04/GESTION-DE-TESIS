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
 * Una clase o reunión para <b>todo el espacio</b>: fecha y hora, título y el enlace
 * (Zoom, Meet) que pega el asesor. La ven todos los miembros con un botón Unirse.
 *
 * <p>No se integra ninguna API de videollamadas: el asesor crea la reunión donde
 * prefiera y pega el enlace. La diferencia con una {@link Asesoria} es el alcance:
 * la sesión es del espacio, la asesoría es de una tesis.
 */
@Entity
@Table(name = "sesion_espacio")
@Getter
@Setter
public class SesionEspacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(name = "fecha_hora", nullable = false)
    private Instant fechaHora;

    @Column(nullable = false, length = 1000)
    private String enlace;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
