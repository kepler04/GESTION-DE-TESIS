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
 * Un mensaje privado de una persona a otra (Decisión 28). Texto simple, sin
 * adjuntos: para un archivo están las entregas y los materiales.
 */
@Entity
@Table(name = "mensaje")
@Getter
@Setter
public class Mensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "remitente_id", nullable = false)
    private User remitente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private User destinatario;

    @Column(nullable = false, columnDefinition = "text")
    private String texto;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    /** Cuándo lo vio el destinatario; null si todavía no abrió la conversación. */
    @Column(name = "leido_at")
    private Instant leidoAt;
}
