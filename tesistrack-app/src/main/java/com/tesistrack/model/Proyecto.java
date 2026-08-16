package com.tesistrack.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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

    /**
     * Los estudiantes que hacen la tesis. Casi siempre uno, pero una tesis puede
     * ser grupal: el Entregable 0 lo pide explícitamente ("estudiante o estudiantes
     * asociados").
     *
     * <p>Se carga con {@code EAGER} a propósito, al revés que el resto de las
     * relaciones: no hay pantalla que muestre un proyecto sin decir de quién es, y
     * {@link com.tesistrack.service.AccesoService} necesita la lista en <b>cada</b>
     * request protegida para resolver la pertenencia. Con {@code LAZY} sería una
     * consulta extra garantizada más el riesgo de {@code LazyInitializationException}
     * al armar los DTO fuera de la transacción.
     *
     * <p>Nunca queda vacía: quien crea el proyecto entra como primer estudiante y
     * {@link #quitarEstudiante} se niega a sacar al último.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "proyecto_estudiante",
        joinColumns = @JoinColumn(name = "proyecto_id"),
        inverseJoinColumns = @JoinColumn(name = "estudiante_id"))
    private Set<User> estudiantes = new LinkedHashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asesor_id")
    private User asesor;

    /**
     * Cuándo arrancó la tesis. Puede ser anterior al alta en la plataforma —alguien
     * que viene trabajando hace meses y recién ahora la registra—, así que no se
     * deriva de {@link #createdAt}.
     */
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio = LocalDate.now();

    /**
     * Etiqueta con la que el asesor agrupa sus tesis. Opcional y siempre suya:
     * si el proyecto cambia de asesor, el área deja de tener sentido y se limpia.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private Area area;

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

    public Set<User> getEstudiantes() {
        return estudiantes;
    }

    /** Ordenados por nombre, para que la lista no baile entre respuestas. */
    public List<User> getEstudiantesOrdenados() {
        return estudiantes.stream()
            .sorted(Comparator.comparing(User::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
            .toList();
    }

    public void agregarEstudiante(User estudiante) {
        estudiantes.add(estudiante);
    }

    /**
     * Saca a un integrante del grupo.
     *
     * <p>Se niega a sacar al último: un proyecto sin estudiantes no le pertenecería
     * a nadie y quedaría invisible para todos menos el coordinador, sin forma de
     * recuperarlo desde la aplicación.
     */
    public void quitarEstudiante(User estudiante) {
        if (estudiantes.size() <= 1) {
            throw new IllegalArgumentException(
                "Una tesis no puede quedarse sin ningún estudiante");
        }
        estudiantes.removeIf(e -> Objects.equals(e.getId(), estudiante.getId()));
    }

    public boolean tieneEstudiante(Long usuarioId) {
        return estudiantes.stream().anyMatch(e -> Objects.equals(e.getId(), usuarioId));
    }

    public User getAsesor() {
        return asesor;
    }

    public void setAsesor(User asesor) {
        this.asesor = asesor;
    }

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
