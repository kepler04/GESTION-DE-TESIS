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

    /**
     * Enlace externo al documento. Se mantiene junto a la carga real: hay quien
     * trabaja en Drive y prefiere compartir el enlace vivo en vez de una copia
     * congelada.
     */
    @Column(name = "archivo_url", length = 500)
    private String archivoUrl;

    /** Tipo MIME de lo subido, para devolverlo bien al descargar. */
    @Column(name = "archivo_tipo", length = 120)
    private String archivoTipo;

    /** Tamaño en bytes. Metadato barato: evita cargar el archivo solo para mostrarlo. */
    @Column(name = "archivo_tamano")
    private Long archivoTamano;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoEntrega estado = EstadoEntrega.EN_REVISION;

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

    public String getArchivoTipo() {
        return archivoTipo;
    }

    public void setArchivoTipo(String archivoTipo) {
        this.archivoTipo = archivoTipo;
    }

    public Long getArchivoTamano() {
        return archivoTamano;
    }

    public void setArchivoTamano(Long archivoTamano) {
        this.archivoTamano = archivoTamano;
    }

    public EstadoEntrega getEstado() {
        return estado;
    }

    public void setEstado(EstadoEntrega estado) {
        this.estado = estado;
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
