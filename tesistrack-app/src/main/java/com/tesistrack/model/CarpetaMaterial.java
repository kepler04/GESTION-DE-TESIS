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
import lombok.Getter;
import lombok.Setter;

/**
 * Carpeta de material de un espacio ("Temas de tesis", "Rúbrica", "Clases").
 *
 * <p>La arma el asesor dueño del espacio; los estudiantes del espacio solo ven y
 * descargan. Un espacio nuevo recibe tres carpetas sugeridas, que se pueden
 * renombrar o borrar como cualquier otra.
 */
@Entity
@Table(
    name = "carpeta_material",
    uniqueConstraints = @UniqueConstraint(columnNames = {"area_id", "nombre"}))
@Getter
@Setter
public class CarpetaMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(nullable = false)
    private Integer orden = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
