package com.tesistrack.mapper;

import org.mapstruct.Mapper;

import com.tesistrack.dto.UserDto;
import com.tesistrack.model.User;

/**
 * Mapper de usuario usado en las respuestas de autenticacion.
 *
 * Mantiene fuera del DTO atributos sensibles de la entidad, como passwordHash.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
}
