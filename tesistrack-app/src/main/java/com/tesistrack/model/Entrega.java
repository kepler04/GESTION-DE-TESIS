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
import jakarta.persistence.UniqueConstraint;

/**
 * Entrega de un hito. Cada versión de un documento es una entrega distinta
 * del mismo hito (v1, v2, v3...), numerada con {@link #version}.
 */
@Entity
@Table(
        name = "entrega",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_entrega_hito_version",
                columnNames = { "hito_id", "version" }))
public class Entrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hito_id", nullable = false)
    private Hito hito;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Column(name = "archivo_nombre")
    private String archivoNombre;

    @Column(name = "archivo_url", length = 500)
    private String archivoUrl;

    @Column(columnDefinition = "text")
    private String comentario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entregada_por_id", nullable = false)
    private User entregadaPor;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public Hito getHito() {
        return hito;
    }

    public void setHito(Hito hito) {
        this.hito = hito;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getArchivoNombre() {
        return archivoNombre;
    }

    public void setArchivoNombre(String archivoNombre) {
        this.archivoNombre = archivoNombre;
    }

    public String getArchivoUrl() {
        return archivoUrl;
    }

    public void setArchivoUrl(String archivoUrl) {
        this.archivoUrl = archivoUrl;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public User getEntregadaPor() {
        return entregadaPor;
    }

    public void setEntregadaPor(User entregadaPor) {
        this.entregadaPor = entregadaPor;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
