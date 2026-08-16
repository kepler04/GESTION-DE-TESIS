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

/**
 * El contenido binario de una entrega, en su propia tabla.
 *
 * <p><b>Por qué separado de {@link Entrega}:</b> un {@code byte[]} en la misma
 * entidad se carga entero en cada consulta. Marcarlo {@code LAZY} no alcanza —para
 * atributos básicos Hibernate solo lo respeta con <i>bytecode enhancement</i>, que
 * este proyecto no usa—, así que listar diez versiones traería diez PDF a memoria
 * para mostrar diez nombres.
 *
 * <p>Con la tabla aparte, el listado nunca toca los bytes: solo la descarga los pide.
 * Los metadatos (nombre, tipo, tamaño) viven en {@code Entrega} porque son baratos y
 * se muestran siempre.
 */
@Entity
@Table(name = "archivo_entrega")
public class ArchivoEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "entrega_id", nullable = false, unique = true)
    private Entrega entrega;

    /**
     * Sin {@code @Lob} a propósito. Con esa anotación Hibernate mapea el arreglo a
     * {@code oid} —un Large Object de PostgreSQL—, que guarda solo un puntero a
     * {@code pg_largeobject}: hay que leerlo dentro de una transacción y borrar la
     * fila no borra el objeto, así que van quedando huérfanos ocupando lugar.
     * {@code bytea} guarda los bytes en la propia fila y se comporta como cualquier
     * otra columna.
     */
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] contenido;

    public Long getId() {
        return id;
    }

    public Entrega getEntrega() {
        return entrega;
    }

    public void setEntrega(Entrega entrega) {
        this.entrega = entrega;
    }

    public byte[] getContenido() {
        return contenido;
    }

    public void setContenido(byte[] contenido) {
        this.contenido = contenido;
    }
}
