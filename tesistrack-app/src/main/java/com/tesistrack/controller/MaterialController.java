package com.tesistrack.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tesistrack.dto.CarpetaDto;
import com.tesistrack.dto.CarpetaRequest;
import com.tesistrack.dto.MaterialDto;
import com.tesistrack.dto.MaterialEnlaceRequest;
import com.tesistrack.dto.MaterialRenombrarRequest;
import com.tesistrack.service.MaterialService;

import jakarta.validation.Valid;

/**
 * Carpetas y materiales de un espacio. Atiende rutas bajo {@code /areas/{id}} y
 * bajo {@code /carpetas} y {@code /materiales}, igual que los demás controllers
 * de recursos anidados.
 */
@RestController
@RequestMapping("/api")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/areas/{areaId}/carpetas")
    public List<CarpetaDto> listar(@PathVariable Long areaId, Authentication authentication) {
        return materialService.listar(areaId, authentication);
    }

    @PostMapping("/areas/{areaId}/carpetas")
    @ResponseStatus(HttpStatus.CREATED)
    public CarpetaDto crearCarpeta(
            @PathVariable Long areaId,
            @Valid @RequestBody CarpetaRequest request,
            Authentication authentication) {
        return materialService.crearCarpeta(areaId, request, authentication);
    }

    @PutMapping("/carpetas/{id}")
    public CarpetaDto renombrarCarpeta(
            @PathVariable Long id,
            @Valid @RequestBody CarpetaRequest request,
            Authentication authentication) {
        return materialService.renombrarCarpeta(id, request, authentication);
    }

    @DeleteMapping("/carpetas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCarpeta(@PathVariable Long id, Authentication authentication) {
        materialService.eliminarCarpeta(id, authentication);
    }

    @PostMapping("/carpetas/{carpetaId}/materiales")
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialDto crearEnlace(
            @PathVariable Long carpetaId,
            @Valid @RequestBody MaterialEnlaceRequest request,
            Authentication authentication) {
        return materialService.crearEnlace(carpetaId, request, authentication);
    }

    /** Multipart: el campo {@code archivo} y, opcional, un {@code titulo}. */
    @PostMapping("/carpetas/{carpetaId}/materiales/archivo")
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialDto subirArchivo(
            @PathVariable Long carpetaId,
            @RequestParam(value = "titulo", required = false) String titulo,
            @RequestParam("archivo") MultipartFile archivo,
            Authentication authentication) {
        return materialService.subirArchivo(carpetaId, titulo, archivo, authentication);
    }

    @PutMapping("/materiales/{id}")
    public MaterialDto editar(
            @PathVariable Long id,
            @Valid @RequestBody MaterialRenombrarRequest request,
            Authentication authentication) {
        return materialService.editar(id, request, authentication);
    }

    @DeleteMapping("/materiales/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarMaterial(@PathVariable Long id, Authentication authentication) {
        materialService.eliminarMaterial(id, authentication);
    }

    @GetMapping("/materiales/{id}/archivo")
    public ResponseEntity<byte[]> descargar(@PathVariable Long id, Authentication authentication) {
        MaterialService.ArchivoDescarga archivo = materialService.descargar(id, authentication);
        // filename* con UTF-8: los nombres de archivo traen tildes y ñ.
        String nombre = URLEncoder.encode(archivo.nombre(), StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
            // attachment: el archivo lo subió un usuario; abrirlo "en línea" dentro del
            // origen de la aplicación sería ejecutar contenido ajeno.
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + nombre)
            .contentType(tipo(archivo.tipo()))
            .body(archivo.contenido());
    }

    /** El tipo lo declara quien sube el archivo: si no es válido se cae a binario genérico. */
    private static MediaType tipo(String declarado) {
        if (declarado == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        try {
            return MediaType.parseMediaType(declarado);
        } catch (InvalidMediaTypeException e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
