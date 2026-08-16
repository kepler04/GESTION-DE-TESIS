package com.tesistrack.service;

import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.config.NotFoundException;
import com.tesistrack.model.Proyecto;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.UserRepository;

/**
 * Resuelve el usuario autenticado y decide quién puede tocar qué.
 *
 * Regla base (Decisión 7): el acceso se resuelve por <b>pertenencia al proyecto</b>,
 * no solo por rol. Tener rol ASESOR no habilita a tocar un proyecto ajeno.
 * El coordinador es la única excepción: lee todo, no escribe nada (Decisión 8).
 */
@Service
public class AccesoService {

    private final UserRepository userRepository;

    public AccesoService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Usuario detrás del JWT de la request actual. */
    public User usuarioActual(Authentication authentication) {
        // Normalizado por si el token se emitió antes de que el email se guardara
        // siempre en minúsculas (ver User#setEmail).
        String email = User.normalizarEmail(authentication.getName());
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
    }

    /** Puede ver: el estudiante o el asesor del proyecto, o cualquier coordinador. */
    public void verificarLectura(Proyecto proyecto, User usuario) {
        if (usuario.getRole() == Role.COORDINADOR) {
            return;
        }
        if (esEstudianteDe(proyecto, usuario) || esAsesorDe(proyecto, usuario)) {
            return;
        }
        throw new ForbiddenException("No tenés acceso a este proyecto");
    }

    /** Acciones del asesor: hitos, asesorías, acuerdos, tareas, observaciones. */
    public void verificarAsesorDelProyecto(Proyecto proyecto, User usuario) {
        if (!esAsesorDe(proyecto, usuario)) {
            throw new ForbiddenException("Solo el asesor del proyecto puede hacer esto");
        }
    }

    /** Acciones del estudiante: crear el proyecto, elegir asesor, subir entregas. */
    public void verificarEstudianteDelProyecto(Proyecto proyecto, User usuario) {
        if (!esEstudianteDe(proyecto, usuario)) {
            throw new ForbiddenException("Solo el estudiante del proyecto puede hacer esto");
        }
    }

    public boolean esEstudianteDe(Proyecto proyecto, User usuario) {
        return usuario.getRole() == Role.ESTUDIANTE
            && Objects.equals(proyecto.getEstudiante().getId(), usuario.getId());
    }

    public boolean esAsesorDe(Proyecto proyecto, User usuario) {
        return usuario.getRole() == Role.ASESOR
            && proyecto.getAsesor() != null
            && Objects.equals(proyecto.getAsesor().getId(), usuario.getId());
    }
}
