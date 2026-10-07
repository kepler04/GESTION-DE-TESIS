package com.tesistrack.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Reunión de asesoría sobre un proyecto, ya sea registrada después de ocurrir o
 * programada con anticipación. Es el inicio de la cadena asesoría -> acuerdo -> tarea.
 */
@Entity
@Table(name = "asesoria")
public class Asesoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    /**
     * Cuándo ocurrió la reunión, o cuándo está programada si todavía no se hizo
     * (no cuándo se registró).
     */
    @Column(nullable = false)
    private Instant fecha;

    /** Las asesorías que ya existían eran reuniones ya hechas: por eso el default. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoAsesoria estado = EstadoAsesoria.REALIZADA;

    /**
     * Enlace de la videollamada (Zoom, Meet). Se pega a mano, siempre {@code https://};
     * no se integra ninguna API. Opcional: la reunión puede ser presencial.
     */
    @Column(length = 1000)
    private String enlace;

    @Column(nullable = false)
    private String tema;

    @Column(columnDefinition = "text")
    private String resumen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrada_por_id", nullable = false)
    private User registradaPor;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }

    public Instant getFecha() {
        return fecha;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public EstadoAsesoria getEstado() {
        return estado;
    }

    public void setEstado(EstadoAsesoria estado) {
        this.estado = estado;
    }

    public String getEnlace() {
        return enlace;
    }

    public void setEnlace(String enlace) {
        this.enlace = enlace;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public String getResumen() {
        return resumen;
    }

    public void setResumen(String resumen) {
        this.resumen = resumen;
    }

    public User getRegistradaPor() {
        return registradaPor;
    }

    public void setRegistradaPor(User registradaPor) {
        this.registradaPor = registradaPor;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
