package com.tesistrack.dto;

import com.tesistrack.model.Role;
import com.tesistrack.model.User;

public record UserDto(Long id, String name, String email, Role role) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
