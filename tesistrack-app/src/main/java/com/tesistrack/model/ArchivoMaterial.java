package com.tesistrack.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Los bytes de un material que es un archivo, en su propia tabla. Ver
 * {@link ArchivoEntrega} para el porqué de separarlos y de no usar {@code @Lob}.
 */
@Entity
@Table(name = "archivo_material")
@Getter
@Setter
public class ArchivoMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false, unique = true)
    private Material material;

    /** Sin {@code @Lob}: con eso Hibernate mapea a {@code oid} y deja huérfanos. */
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] contenido;
}
