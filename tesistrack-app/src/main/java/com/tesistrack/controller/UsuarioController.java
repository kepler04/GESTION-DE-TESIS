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

    /**
     * Los asesores que un estudiante puede elegir por su nombre, sin un código de
     * clase: solo los que dan asesorías privadas (Decisión 24). Quien trabaja con
     * clases se encuentra con el código, no con esta lista.
     */
    @GetMapping("/asesores")
    public List<UserDto> asesores() {
        return userRepository.findByRoleAndAsesoriasPrivadasTrue(Role.ASESOR).stream()
            .map(UserDto::from)
            .toList();
    }
}
