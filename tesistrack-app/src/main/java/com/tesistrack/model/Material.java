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
 * Un material de una carpeta: un <b>enlace</b> (Drive, la grabación de una clase,
 * un paper) o un <b>archivo</b> (PDF, Word, PowerPoint). Siempre uno de los dos,
 * nunca ambos ni ninguno: lo garantiza un {@code CHECK} en la base.
 *
 * <p>Los metadatos del archivo viven acá porque son baratos y se muestran siempre;
 * los bytes están en {@link ArchivoMaterial}, para que listar una carpeta no
 * arrastre los archivos a memoria (mismo criterio que {@link ArchivoEntrega}).
 */
@Entity
@Table(name = "material")
@Getter
@Setter
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "carpeta_id", nullable = false)
    private CarpetaMaterial carpeta;

    @Column(nullable = false, length = 160)
    private String titulo;

    /** Solo para los materiales que son un enlace. Siempre {@code https://}. */
    @Column(length = 1000)
    private String url;

    @Column(name = "archivo_nombre")
    private String archivoNombre;

    @Column(name = "archivo_tipo", length = 120)
    private String archivoTipo;

    @Column(name = "archivo_tamano")
    private Long archivoTamano;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public boolean esArchivo() {
        return archivoNombre != null;
    }
}
