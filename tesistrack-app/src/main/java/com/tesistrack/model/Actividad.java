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
 * Consigna que el asesor deja a todo un área de una vez ("Actividad 1 - Matriz de
 * consistencia").
 *
 * <p><b>No es una cadena nueva.</b> La actividad es la plantilla; lo que cada
 * estudiante ve y entrega sigue siendo un {@link Hito} de su propio proyecto, con
 * sus entregas y observaciones intactas. Si la actividad fuera la unidad que el
 * estudiante entrega, habría dos caminos paralelos para lo mismo y la trazabilidad
 * —que es el producto— quedaría partida al medio.
 *
 * <p>Por eso el reparto solo crea hitos: {@code Area → Actividad → N hitos}, uno
 * por proyecto del área.
 */
@Entity
@Table(name = "actividad")
public class Actividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "text")
    private String descripcion;

    @Column(name = "fecha_limite")
    private LocalDate fechaLimite;

    /** Posición dentro del área; se copia al hito de cada estudiante. */
    @Column(nullable = false)
    private Integer orden = 0;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(LocalDate fechaLimite) {
        this.fechaLimite = fechaLimite;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
