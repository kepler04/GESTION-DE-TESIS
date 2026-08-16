package com.tesistrack.service;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CrearEntregaRequest;
import com.tesistrack.dto.EntregaDto;
import com.tesistrack.model.ArchivoEntrega;
import com.tesistrack.model.Entrega;
import com.tesistrack.model.EstadoEntrega;
import com.tesistrack.model.EstadoHito;
import com.tesistrack.model.Hito;
import com.tesistrack.model.User;
import com.tesistrack.repository.ArchivoEntregaRepository;
import com.tesistrack.repository.EntregaRepository;

/**
 * Entregas de un hito. Cada entrega es una versión nueva (Decisión 5): el número
 * lo calcula el backend, el cliente no lo envía.
 */
@Service
@Transactional
public class EntregaService {

    /**
     * Tope de la carga real. Una tesis en PDF entra de sobra; el límite existe para
     * que nadie deje la base inutilizable subiendo un video.
     */
    public static final long TAMANO_MAXIMO = 15L * 1024 * 1024;

    private final EntregaRepository entregaRepository;
    private final ArchivoEntregaRepository archivoRepository;
    private final HitoService hitoService;
    private final AccesoService acceso;

    public EntregaService(
            EntregaRepository entregaRepository,
            ArchivoEntregaRepository archivoRepository,
            HitoService hitoService,
            AccesoService acceso) {
        this.entregaRepository = entregaRepository;
        this.archivoRepository = archivoRepository;
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

    /**
     * Guarda el documento de una entrega dentro de la base.
     *
     * <p>Va en un endpoint aparte del alta y no en el mismo cuerpo: mezclar JSON y
     * binario obliga a {@code multipart} con una parte JSON, que del lado del
     * navegador hay que armar a mano como {@code Blob}. Dos llamadas simples salen
     * más baratas que una complicada, y además dejan volver a subir el archivo de
     * una entrega ya creada.
     */
    public EntregaDto guardarArchivo(Long entregaId, MultipartFile archivo, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Entrega entrega = buscar(entregaId);
        // Solo el grupo de la tesis sube; el asesor lee y observa, no entrega.
        acceso.verificarEstudianteDelProyecto(entrega.getHito().getProyecto(), usuario);

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("No llegó ningún archivo");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException(
                "El archivo supera los " + (TAMANO_MAXIMO / (1024 * 1024)) + " MB");
        }

        // Reemplazar el archivo de una entrega no crea una versión nueva: la versión
        // la marca la entrega, no el archivo.
        ArchivoEntrega guardado = archivoRepository.findByEntregaId(entregaId)
            .orElseGet(() -> {
                ArchivoEntrega nuevo = new ArchivoEntrega();
                nuevo.setEntrega(entrega);
                return nuevo;
            });

        try {
            guardado.setContenido(archivo.getBytes());
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer el archivo subido", e);
        }
        archivoRepository.save(guardado);

        entrega.setArchivoNombre(archivo.getOriginalFilename());
        entrega.setArchivoTipo(archivo.getContentType());
        entrega.setArchivoTamano(archivo.getSize());

        return EntregaDto.from(entrega);
    }

    /** Descarga: la puede pedir cualquiera con acceso al proyecto, incluido el asesor. */
    @Transactional(readOnly = true)
    public ArchivoDescarga descargarArchivo(Long entregaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Entrega entrega = buscar(entregaId);
        acceso.verificarLectura(entrega.getHito().getProyecto(), usuario);

        ArchivoEntrega archivo = archivoRepository.findByEntregaId(entregaId)
            .orElseThrow(() -> new NotFoundException("Esta entrega no tiene archivo cargado"));

        return new ArchivoDescarga(
            archivo.getContenido(),
            entrega.getArchivoNombre() == null ? "entrega" : entrega.getArchivoNombre(),
            entrega.getArchivoTipo());
    }

    /** El veredicto del asesor sobre una versión concreta. */
    public EntregaDto cambiarEstado(Long entregaId, EstadoEntrega estado, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Entrega entrega = buscar(entregaId);
        acceso.verificarAsesorDelProyecto(entrega.getHito().getProyecto(), usuario);

        entrega.setEstado(estado);
        return EntregaDto.from(entrega);
    }

    Entrega buscar(Long entregaId) {
        return entregaRepository.findById(entregaId)
            .orElseThrow(() -> new NotFoundException("Entrega no encontrada"));
    }

    /** Lo que el controller necesita para armar la respuesta de descarga. */
    public record ArchivoDescarga(byte[] contenido, String nombre, String tipo) {
    }
}
