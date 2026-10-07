package com.tesistrack.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.ForbiddenException;
import com.tesistrack.dto.PerfilDto;
import com.tesistrack.mapper.UserMapper;
import com.tesistrack.model.Role;
import com.tesistrack.model.User;
import com.tesistrack.repository.ProyectoRepository;

/**
 * El perfil del propio usuario y sus preferencias.
 *
 * <p>Por ahora hay una sola: si el asesor da <b>asesorías privadas</b>, uno a uno y
 * fuera de una clase (Decisión 24). Es una preferencia y no un permiso: no cambia
 * qué puede ver o hacer nadie, solo si el menú le ofrece "Asesorías privadas" y si
 * los estudiantes pueden elegirlo de la lista de asesores.
 */
@Service
@Transactional
public class PerfilService {

    private final AccesoService acceso;
    private final ProyectoRepository proyectoRepository;
    private final UserMapper userMapper;

    public PerfilService(AccesoService acceso, ProyectoRepository proyectoRepository, UserMapper userMapper) {
        this.acceso = acceso;
        this.proyectoRepository = proyectoRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public PerfilDto perfil(Authentication authentication) {
        return userMapper.toPerfil(acceso.usuarioActual(authentication));
    }

    /**
     * Cambia la preferencia. Solo la tiene el rol ASESOR.
     *
     * <p>No se puede pasar a "no" mientras queden asesorados privados: dejarían de
     * aparecer en su menú sin haberse desvinculado, y nadie los atendería. Primero
     * hay que quitarlos de la lista, que es un acto consciente, no un efecto de un
     * interruptor.
     */
    public PerfilDto cambiarAsesoriasPrivadas(boolean valor, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        if (usuario.getRole() != Role.ASESOR) {
            throw new ForbiddenException("Solo un asesor puede elegir si da asesorías privadas");
        }
        if (!valor) {
            long privados = proyectoRepository.countByAsesorIdAndAreaIsNull(usuario.getId());
            if (privados > 0) {
                throw new IllegalArgumentException(
                    "Todavía tenés " + privados + (privados == 1 ? " asesorado privado" : " asesorados privados")
                        + ". Quitalos de tu lista antes de desactivar las asesorías privadas");
            }
        }
        usuario.setAsesoriasPrivadas(valor);
        return userMapper.toPerfil(usuario);
    }
}
