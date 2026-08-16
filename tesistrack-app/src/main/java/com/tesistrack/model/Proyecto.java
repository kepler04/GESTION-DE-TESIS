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
 * Proyecto de tesis. Es la raíz de las dos cadenas de trazabilidad:
 * hitos -> entregas -> observaciones, y asesorías -> acuerdos -> tareas.
 *
 * El asesor es opcional: un proyecto puede existir antes de que se le asigne uno.
 */
@Entity
@Table(name = "proyecto")
public class Proyecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "text")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoProyecto estado = EstadoProyecto.EN_CURSO;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private User estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asesor_id")
    private User asesor;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public EstadoProyecto getEstado() {
        return estado;
    }

    public void setEstado(EstadoProyecto estado) {
        this.estado = estado;
    }

    public User getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(User estudiante) {
        this.estudiante = estudiante;
    }

    public User getAsesor() {
        return asesor;
    }

    public void setAsesor(User asesor) {
        this.asesor = asesor;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
