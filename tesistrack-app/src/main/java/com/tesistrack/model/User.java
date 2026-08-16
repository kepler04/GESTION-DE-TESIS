package com.tesistrack.model;

import java.time.Instant;
import java.util.Locale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // --- perfil ---
    // Todos opcionales y nullables: los usuarios creados antes de que existiera
    // el registro en dos pasos no los tienen, y ddl-auto=update no puede agregar
    // una columna NOT NULL sobre filas ya existentes.
    //
    // Ninguno de estos campos sale en UserDto. UserDto viaja embebido en cada
    // entrega, observación y tarea, así que exponerlos ahí publicaría el teléfono
    // y la ubicación de una persona en respuestas que no los necesitan.
    @Column(length = 40)
    private String telefono;

    @Column(length = 120)
    private String ubicacion;

    @Column(length = 120)
    private String carrera;

    /** Universidad, organización o "Independiente". Texto libre: no hay entidad Institución (Decisión 1). */
    @Column(length = 160)
    private String organizacion;

    // --- consentimiento ---
    // Se guarda qué versión aceptó y cuándo. Sin esto no se puede demostrar
    // después que la persona consintió, que es el punto de pedirlo.
    @Column(name = "politica_version", length = 20)
    private String politicaVersion;

    @Column(name = "politica_aceptada_at")
    private Instant politicaAceptadaAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    /**
     * Guarda el email siempre normalizado: sin espacios al borde y en minúsculas.
     *
     * Va en la entidad y no solo en el service para que ningún camino de escritura
     * pueda dejar una fila sin normalizar. Antes el email se guardaba tal cual se
     * escribía, así que {@code Ana@utec.pe} y {@code ana@utec.pe} podían convivir
     * como dos cuentas distintas, y quien se registraba con mayúsculas no podía
     * entrar escribiéndolo en minúsculas.
     */
    public void setEmail(String email) {
        this.email = normalizarEmail(email);
    }

    /** {@code Locale.ROOT} a propósito: con el locale turco, "I" se convierte en "ı". */
    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public String getCarrera() {
        return carrera;
    }

    public void setCarrera(String carrera) {
        this.carrera = carrera;
    }

    public String getOrganizacion() {
        return organizacion;
    }

    public void setOrganizacion(String organizacion) {
        this.organizacion = organizacion;
    }

    public String getPoliticaVersion() {
        return politicaVersion;
    }

    public void setPoliticaVersion(String politicaVersion) {
        this.politicaVersion = politicaVersion;
    }

    public Instant getPoliticaAceptadaAt() {
        return politicaAceptadaAt;
    }

    public void setPoliticaAceptadaAt(Instant politicaAceptadaAt) {
        this.politicaAceptadaAt = politicaAceptadaAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
