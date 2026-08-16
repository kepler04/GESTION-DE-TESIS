package com.tesistrack.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tesistrack.dto.AuthResponse;
import com.tesistrack.dto.LoginRequest;
import com.tesistrack.dto.RegisterRequest;
import com.tesistrack.dto.UserDto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (request.role() == Role.COORDINADOR) {
            throw new IllegalArgumentException("El rol coordinador no se puede autoasignar en el registro");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserDto.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserDto.from(user));
    }
}
