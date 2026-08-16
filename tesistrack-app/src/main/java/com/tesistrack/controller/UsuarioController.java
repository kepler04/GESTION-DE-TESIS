package com.tesistrack.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tesistrack.dto.UserDto;
import com.tesistrack.model.Role;
import com.tesistrack.repository.UserRepository;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UserRepository userRepository;

    public UsuarioController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Lista de asesores disponibles, para que el estudiante elija al crear su proyecto. */
    @GetMapping("/asesores")
    public List<UserDto> asesores() {
        return userRepository.findByRole(Role.ASESOR).stream().map(UserDto::from).toList();
    }
}
