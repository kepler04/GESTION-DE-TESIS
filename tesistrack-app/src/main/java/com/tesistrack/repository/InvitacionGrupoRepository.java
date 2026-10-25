package com.tesistrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tesistrack.model.InvitacionGrupo;

public interface InvitacionGrupoRepository extends JpaRepository<InvitacionGrupo, Long> {

    List<InvitacionGrupo> findByInvitadoIdOrderByCreatedAtDesc(Long invitadoId);

    List<InvitacionGrupo> findByProyectoIdOrderByCreatedAtDesc(Long proyectoId);

    boolean existsByProyectoIdAndInvitadoId(Long proyectoId, Long invitadoId);

    /** Al entrar a un grupo de una clase, las demás invitaciones de esa clase dejan de tener sentido. */
    @Modifying
    @Query("delete from InvitacionGrupo i where i.invitado.id = :invitado and i.proyecto.area.id = :area")
    int borrarDeLaClase(@Param("invitado") Long invitado, @Param("area") Long area);
}
