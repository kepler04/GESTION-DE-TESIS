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
 * Un aviso del profesor para toda la clase, en el Tablón. Texto simple: sin
 * comentarios, sin adjuntos ni notificaciones por correo. Lo publica el dueño de
 * la clase y lo leen todos sus miembros.
 */
@Entity
@Table(name = "aviso")
@Getter
@Setter
public class Aviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @Column(nullable = false, columnDefinition = "text")
    private String texto;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
