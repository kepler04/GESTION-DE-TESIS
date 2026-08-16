package com.tesistrack.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CrearEntregaRequest;
import com.tesistrack.dto.EntregaDto;
import com.tesistrack.model.Entrega;
import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.Hito;
import com.tesistrack.model.User;
import com.tesistrack.repository.EntregaRepository;

/**
 * Entregas de un hito. Cada entrega es una versión nueva (Decisión 5): el número
 * lo calcula el backend, el cliente no lo envía.
 */
@Service
@Transactional
public class EntregaService {

    private final EntregaRepository entregaRepository;
    private final HitoService hitoService;
    private final AccesoService acceso;

    public EntregaService(
            EntregaRepository entregaRepository,
            HitoService hitoService,
            AccesoService acceso) {
        this.entregaRepository = entregaRepository;
        this.hitoService = hitoService;
        this.acceso = acceso;
    }

    public EntregaDto crear(Long hitoId, CrearEntregaRequest request, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Hito hito = hitoService.buscar(hitoId);
        acceso.verificarEstudianteDelProyecto(hito.getProyecto(), usuario);

        int siguienteVersion = entregaRepository.findFirstByHitoIdOrderByVersionDesc(hitoId)
            .map(ultima -> ultima.getVersion() + 1)
            .orElse(1);

        Entrega entrega = new Entrega();
        entrega.setHito(hito);
        entrega.setVersion(siguienteVersion);
        entrega.setArchivoNombre(request.archivoNombre());
        entrega.setArchivoUrl(request.archivoUrl());
        entrega.setComentario(request.comentario());
        entrega.setEntregadaPor(usuario);

        // Subir una entrega deja el hito esperando revisión, incluso si venía OBSERVADO
        // (es el retorno OBSERVADO -> ENTREGADO del ciclo de corrección).
        hito.setEstado(EstadoHito.ENTREGADO);

        return EntregaDto.from(entregaRepository.save(entrega));
    }

    @Transactional(readOnly = true)
    public List<EntregaDto> listar(Long hitoId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Hito hito = hitoService.buscar(hitoId);
        acceso.verificarLectura(hito.getProyecto(), usuario);
        return entregaRepository.findByHitoIdOrderByVersionAsc(hitoId).stream()
            .map(EntregaDto::from)
            .toList();
    }

    Entrega buscar(Long entregaId) {
        return entregaRepository.findById(entregaId)
            .orElseThrow(() -> new NotFoundException("Entrega no encontrada"));
    }
}
