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

/**
 * Reunión de asesoría registrada sobre un proyecto. Es el inicio de la cadena
 * asesoría -> acuerdo -> tarea.
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

    /** Cuándo ocurrió la reunión (no cuándo se registró). */
    @Column(nullable = false)
    private Instant fecha;

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
