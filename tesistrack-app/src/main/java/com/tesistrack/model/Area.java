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
 * Etiqueta con la que un asesor agrupa sus propias tesis ("Ingeniería de
 * Software", "UTEC – Posgrado", "Consultorías privadas").
 *
 * <p><b>No es una institución.</b> La Decisión 1 descartó la entidad
 * {@code Institución} y la variante multi-institución: acá no hay membresía, ni
 * permisos por área, ni un área compartida entre varios asesores. Cada área
 * pertenece a un único asesor y solo sirve para que ordene su propia carga de
 * trabajo cuando lleva muchas tesis a la vez.
 *
 * <p>Si alguna vez se necesitara que varios asesores compartan un espacio, eso
 * <i>sí</i> reabre la Decisión 1 y hay que discutirlo antes de tocar esto.
 */
@Entity
@Table(
    name = "area",
    uniqueConstraints = @UniqueConstraint(columnNames = {"propietario_id", "nombre"}))
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombre;

    /**
     * Código que el asesor le pasa a sus asesorados para que se sumen, al estilo
     * de un código de clase. Quien lo usa queda con este asesor y dentro de esta
     * área, sin tener que buscarlo en una lista de todos los asesores.
     *
     * Es único en toda la plataforma, no solo por asesor: es la llave con la que
     * se resuelve el ingreso.
     */
    @Column(nullable = false, unique = true, length = 12)
    private String codigo;

    /** El asesor dueño de la etiqueta. Nadie más la ve ni la puede usar. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "propietario_id", nullable = false)
    private User propietario;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public User getPropietario() {
        return propietario;
    }

    public void setPropietario(User propietario) {
        this.propietario = propietario;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
