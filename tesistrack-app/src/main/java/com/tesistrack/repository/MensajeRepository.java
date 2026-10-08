package com.tesistrack.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tesistrack.model.Mensaje;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    /** Los mensajes entre dos personas, en los dos sentidos, del más viejo al más nuevo. */
    @Query("""
        select m from Mensaje m
        where (m.remitente.id = :a and m.destinatario.id = :b)
           or (m.remitente.id = :b and m.destinatario.id = :a)
        order by m.createdAt asc, m.id asc
        """)
    List<Mensaje> conversacion(@Param("a") Long a, @Param("b") Long b);

    /** Todo lo que mandó o recibió alguien, el más nuevo primero: arma la bandeja. */
    @Query("""
        select m from Mensaje m
        join fetch m.remitente join fetch m.destinatario
        where m.remitente.id = :usuario or m.destinatario.id = :usuario
        order by m.createdAt desc, m.id desc
        """)
    List<Mensaje> deUsuario(@Param("usuario") Long usuario);

    @Query("select count(m) > 0 from Mensaje m where (m.remitente.id = :a and m.destinatario.id = :b) or (m.remitente.id = :b and m.destinatario.id = :a)")
    boolean hayConversacion(@Param("a") Long a, @Param("b") Long b);

    long countByDestinatarioIdAndLeidoAtIsNull(Long destinatarioId);

    @Modifying
    @Query("update Mensaje m set m.leidoAt = :ahora where m.remitente.id = :de and m.destinatario.id = :para and m.leidoAt is null")
    int marcarLeidos(@Param("de") Long de, @Param("para") Long para, @Param("ahora") Instant ahora);
}
