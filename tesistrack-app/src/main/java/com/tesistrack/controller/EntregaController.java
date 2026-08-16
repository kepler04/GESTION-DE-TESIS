package com.tesistrack.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tesistrack.dto.CambiarEstadoEntregaRequest;
import com.tesistrack.dto.CrearEntregaRequest;
import com.tesistrack.dto.EntregaDto;
import com.tesistrack.service.EntregaService;

import jakarta.validation.Valid;

/**
 * Atiende tanto {@code /hitos/{id}/entregas} como {@code /entregas/{id}/...}, igual
 * que el resto de los controllers de recursos anidados.
 */
@RestController
@RequestMapping("/api")
public class EntregaController {

    private final EntregaService entregaService;

    public EntregaController(EntregaService entregaService) {
        this.entregaService = entregaService;
    }

    @PostMapping("/hitos/{hitoId}/entregas")
    @ResponseStatus(HttpStatus.CREATED)
    public EntregaDto crear(
            @PathVariable Long hitoId,
            @Valid @RequestBody CrearEntregaRequest request,
            Authentication authentication) {
        return entregaService.crear(hitoId, request, authentication);
    }

    @GetMapping("/hitos/{hitoId}/entregas")
    public List<EntregaDto> listar(@PathVariable Long hitoId, Authentication authentication) {
        return entregaService.listar(hitoId, authentication);
    }

    /** Sube o reemplaza el documento de una entrega ya creada. */
    @PutMapping("/entregas/{id}/archivo")
    public EntregaDto subirArchivo(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            Authentication authentication) {
        return entregaService.guardarArchivo(id, archivo, authentication);
    }

    @GetMapping("/entregas/{id}/archivo")
    public ResponseEntity<byte[]> descargarArchivo(
            @PathVariable Long id, Authentication authentication) {
        EntregaService.ArchivoDescarga archivo = entregaService.descargarArchivo(id, authentication);

        // filename* con UTF-8: los títulos de tesis suelen traer tildes y ñ, y en
        // el filename simple se convierten en signos raros al descargar.
        String nombre = URLEncoder.encode(archivo.nombre(), StandardCharsets.UTF_8)
            .replace("+", "%20");

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + nombre)
            .contentType(archivo.tipo() == null
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(archivo.tipo()))
            .body(archivo.contenido());
    }

    /** El veredicto del asesor sobre esa versión. */
    @PatchMapping("/entregas/{id}/estado")
    public EntregaDto cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoEntregaRequest request,
            Authentication authentication) {
        return entregaService.cambiarEstado(id, request.estado(), authentication);
    }
}
