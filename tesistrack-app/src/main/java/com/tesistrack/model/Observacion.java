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
 * Observación del asesor sobre una entrega concreta. Cuelga de la entrega
 * (no del hito) para poder reconstruir qué se observó en cada versión.
 */
@Entity
@Table(name = "observacion")
public class Observacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entrega_id", nullable = false)
    private Entrega entrega;

    @Column(nullable = false, columnDefinition = "text")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoObservacion estado = EstadoObservacion.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrada_por_id", nullable = false)
    private User registradaPor;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public Entrega getEntrega() {
        return entrega;
    }

    public void setEntrega(Entrega entrega) {
        this.entrega = entrega;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public EstadoObservacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoObservacion estado) {
        this.estado = estado;
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
