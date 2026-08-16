package com.tesistrack.model;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Tarea concreta con responsable y fecha límite.
 *
 * Normalmente deriva de un acuerdo de asesoría, pero {@code acuerdo} es
 * opcional para permitir tareas sueltas. {@code proyecto} sí es obligatorio:
 * es lo que permite listar los pendientes de un proyecto sin encadenar joins.
 */
@Entity
@Table(name = "tarea")
public class Tarea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acuerdo_id")
    private Acuerdo acuerdo;

    @Column(nullable = false, columnDefinition = "text")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private User responsable;

    @Column(name = "fecha_limite")
    private LocalDate fechaLimite;

    @Column(nullable = false)
    private boolean completada = false;

    @Column(name = "completada_at")
    private Instant completadaAt;

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

    public Acuerdo getAcuerdo() {
        return acuerdo;
    }

    public void setAcuerdo(Acuerdo acuerdo) {
        this.acuerdo = acuerdo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public User getResponsable() {
        return responsable;
    }

    public void setResponsable(User responsable) {
        this.responsable = responsable;
    }

    public LocalDate getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(LocalDate fechaLimite) {
        this.fechaLimite = fechaLimite;
    }

    public boolean isCompletada() {
        return completada;
    }

    public void setCompletada(boolean completada) {
        this.completada = completada;
    }

    public Instant getCompletadaAt() {
        return completadaAt;
    }

    public void setCompletadaAt(Instant completadaAt) {
        this.completadaAt = completadaAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
