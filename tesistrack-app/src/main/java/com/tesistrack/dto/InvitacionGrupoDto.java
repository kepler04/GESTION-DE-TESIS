package com.tesistrack.dto;

import java.time.Instant;
import java.util.List;

import com.tesistrack.model.InvitacionGrupo;

/**
 * Una invitación pendiente a un grupo (Decisión 31). La misma forma sirve para la
 * bandeja del invitado y para la lista del grupo que invitó.
 */
public record InvitacionGrupoDto(
    Long id,
    Long proyectoId,
    String tema,
    List<String> integrantes,
    String clase,
    Long invitadoId,
    String invitado,
    String invitador,
    Instant createdAt) {

    public static InvitacionGrupoDto from(InvitacionGrupo i) {
        var p = i.getProyecto();
        return new InvitacionGrupoDto(
            i.getId(),
            p.getId(),
            p.tieneTema() ? p.getTitulo() : null,
            p.getEstudiantesOrdenados().stream().map(u -> u.getName()).toList(),
            p.getArea() == null ? null : p.getArea().getNombre(),
            i.getInvitado().getId(),
            i.getInvitado().getName(),
            i.getInvitador().getName(),
            i.getCreatedAt());
    }
}
