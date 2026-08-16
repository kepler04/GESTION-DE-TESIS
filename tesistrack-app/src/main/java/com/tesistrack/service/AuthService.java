package com.tesistrack.service;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
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
    private final String politicaVersion;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.politica.version}") String politicaVersion) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.politicaVersion = politicaVersion;
    }

    public AuthResponse register(RegisterRequest request) {
        // Se busca por el email normalizado, igual que como lo guarda User.setEmail:
        // si no, "Ana@utec.pe" pasaría el chequeo y después chocaría contra el
        // UNIQUE de la base con un error feo en vez de este mensaje.
        if (userRepository.existsByEmail(User.normalizarEmail(request.email()))) {
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

        user.setTelefono(limpiar(request.telefono()));
        user.setUbicacion(limpiar(request.ubicacion()));
        user.setCarrera(limpiar(request.carrera()));
        user.setOrganizacion(limpiar(request.organizacion()));

        // El @AssertTrue del request ya garantizó que aceptó; acá queda el rastro
        // de qué versión del texto y en qué momento.
        user.setPoliticaVersion(politicaVersion);
        user.setPoliticaAceptadaAt(Instant.now());

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserDto.from(user));
    }

    /** Un campo opcional que llega vacío se guarda como null, no como "". */
    private static String limpiar(String valor) {
        if (valor == null) {
            return null;
        }
        String podado = valor.trim();
        return podado.isEmpty() ? null : podado;
    }

    /**
     * ¿Ya hay una cuenta con este correo?
     *
     * Sirve para avisarle a alguien en el paso 1 del registro, antes de que cargue
     * todo el perfil del paso 2 para que el envío falle al final. El controller
     * limita la frecuencia de esta consulta: ver {@link LimitadorConsultas}.
     */
    public boolean existeEmail(String email) {
        return email != null && userRepository.existsByEmail(User.normalizarEmail(email));
    }

    public AuthResponse login(LoginRequest request) {
        // Normalizado: entrar no puede depender de si escribiste el correo con
        // mayúsculas o de si el autocompletado le dejó un espacio al final.
        User user = userRepository.findByEmail(User.normalizarEmail(request.email()))
            .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserDto.from(user));
    }
}
