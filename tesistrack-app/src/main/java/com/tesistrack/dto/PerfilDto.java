package com.tesistrack.dto;

import com.tesistrack.model.Role;

/**
 * El usuario tal como lo ve su propia sesión: lo mismo que {@link UserDto} más sus
 * preferencias. Solo lo devuelven el login, el registro y {@code /auth/me}.
 *
 * <p>Va aparte de {@code UserDto} a propósito: ese viaja embebido en cada entrega,
 * observación, tarea y asesoría, y una preferencia personal no tiene por qué
 * publicarse en decenas de respuestas ajenas.
 *
 * @param asesoriasPrivadas si da asesorías privadas, uno a uno y fuera de una clase;
 *     {@code null} mientras no respondió la pregunta (solo para el rol ASESOR)
 */
public record PerfilDto(Long id, String name, String email, Role role, Boolean asesoriasPrivadas) {
}
