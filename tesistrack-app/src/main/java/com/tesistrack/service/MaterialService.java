package com.tesistrack.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tesistrack.config.NotFoundException;
import com.tesistrack.dto.CarpetaDto;
import com.tesistrack.dto.CarpetaRequest;
import com.tesistrack.dto.MaterialDto;
import com.tesistrack.dto.MaterialEnlaceRequest;
import com.tesistrack.dto.MaterialRenombrarRequest;
import com.tesistrack.model.ArchivoMaterial;
import com.tesistrack.model.Area;
import com.tesistrack.model.CarpetaMaterial;
import com.tesistrack.model.Material;
import com.tesistrack.model.User;
import com.tesistrack.repository.ArchivoMaterialRepository;
import com.tesistrack.repository.CarpetaMaterialRepository;
import com.tesistrack.repository.MaterialRepository;

/**
 * Carpetas y materiales de un espacio: lo que el asesor deja para sus estudiantes
 * (temas de tesis, la rúbrica, las clases) como en un aula virtual.
 *
 * <p>El dueño del espacio crea, renombra y borra; los estudiantes que tienen una
 * tesis en él (y el coordinador, que lee todo) solo ven y descargan.
 */
@Service
@Transactional
public class MaterialService {

    public static final long TAMANO_MAXIMO = EntregaService.TAMANO_MAXIMO;

    private final CarpetaMaterialRepository carpetaRepository;
    private final MaterialRepository materialRepository;
    private final ArchivoMaterialRepository archivoRepository;
    private final AreaService areaService;
    private final AccesoService acceso;

    public MaterialService(
            CarpetaMaterialRepository carpetaRepository,
            MaterialRepository materialRepository,
            ArchivoMaterialRepository archivoRepository,
            AreaService areaService,
            AccesoService acceso) {
        this.carpetaRepository = carpetaRepository;
        this.materialRepository = materialRepository;
        this.archivoRepository = archivoRepository;
        this.areaService = areaService;
        this.acceso = acceso;
    }

    // ------------------------------------------------------------------ carpetas

    /** Las carpetas del espacio con sus materiales: dos consultas, no una por carpeta. */
    @Transactional(readOnly = true)
    public List<CarpetaDto> listar(Long areaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        areaService.buscarComoMiembro(areaId, usuario);

        Map<Long, List<MaterialDto>> porCarpeta = new LinkedHashMap<>();
        for (Material material : materialRepository.findByCarpetaAreaIdOrderByCreatedAtAscIdAsc(areaId)) {
            porCarpeta
                .computeIfAbsent(material.getCarpeta().getId(), k -> new ArrayList<>())
                .add(MaterialDto.from(material));
        }
        return carpetaRepository.findByAreaIdOrderByOrdenAscIdAsc(areaId).stream()
            .map(c -> CarpetaDto.from(c, porCarpeta.getOrDefault(c.getId(), List.of())))
            .toList();
    }

    public CarpetaDto crearCarpeta(Long areaId, CarpetaRequest request, Authentication authentication) {
        Area area = areaPropia(areaId, authentication);
        verificarNombreLibre(areaId, request.nombre());

        CarpetaMaterial carpeta = new CarpetaMaterial();
        carpeta.setArea(area);
        carpeta.setNombre(request.nombre());
        carpeta.setOrden(carpetaRepository.findFirstByAreaIdOrderByOrdenDesc(areaId)
            .map(c -> c.getOrden() + 1)
            .orElse(1));
        return CarpetaDto.from(carpetaRepository.save(carpeta), List.of());
    }

    public CarpetaDto renombrarCarpeta(Long id, CarpetaRequest request, Authentication authentication) {
        CarpetaMaterial carpeta = carpetaPropia(id, authentication);
        if (!carpeta.getNombre().equalsIgnoreCase(request.nombre())) {
            verificarNombreLibre(carpeta.getArea().getId(), request.nombre());
        }
        carpeta.setNombre(request.nombre());
        return CarpetaDto.from(carpeta, materialRepository.findByCarpetaId(id).stream()
            .map(MaterialDto::from)
            .toList());
    }

    /**
     * Borra la carpeta con todo lo que tiene adentro. Es irreversible y se lleva los
     * archivos subidos, por eso la interfaz pide confirmar contando cuántos son.
     */
    public void eliminarCarpeta(Long id, Authentication authentication) {
        CarpetaMaterial carpeta = carpetaPropia(id, authentication);
        archivoRepository.borrarDeCarpeta(id);
        materialRepository.deleteAll(materialRepository.findByCarpetaId(id));
        carpetaRepository.delete(carpeta);
    }

    // ----------------------------------------------------------------- materiales

    public MaterialDto crearEnlace(Long carpetaId, MaterialEnlaceRequest request, Authentication authentication) {
        CarpetaMaterial carpeta = carpetaPropia(carpetaId, authentication);

        Material material = new Material();
        material.setCarpeta(carpeta);
        material.setTitulo(request.titulo().trim());
        material.setUrl(Enlaces.httpsObligatorio(request.url()));
        return MaterialDto.from(materialRepository.save(material));
    }

    /**
     * Sube un archivo como material. A diferencia de las entregas, va en un solo
     * paso (multipart con el título): un material no existe sin su contenido, así
     * que no hay un estado intermedio "creado pero sin archivo" que cuidar.
     */
    public MaterialDto subirArchivo(
            Long carpetaId, String titulo, MultipartFile archivo, Authentication authentication) {
        CarpetaMaterial carpeta = carpetaPropia(carpetaId, authentication);

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("No llegó ningún archivo");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException(
                "El archivo supera los " + (TAMANO_MAXIMO / (1024 * 1024)) + " MB");
        }
        String nombre = nombreSeguro(archivo.getOriginalFilename());

        Material material = new Material();
        material.setCarpeta(carpeta);
        material.setTitulo(titulo == null || titulo.isBlank() ? quitarExtension(nombre) : titulo.trim());
        if (material.getTitulo().length() > 160) {
            throw new IllegalArgumentException("El título es demasiado largo");
        }
        material.setArchivoNombre(nombre);
        material.setArchivoTipo(archivo.getContentType());
        material.setArchivoTamano(archivo.getSize());
        materialRepository.save(material);

        ArchivoMaterial contenido = new ArchivoMaterial();
        contenido.setMaterial(material);
        try {
            contenido.setContenido(archivo.getBytes());
        } catch (IOException e) {
            throw new IllegalArgumentException("No se pudo leer el archivo subido", e);
        }
        archivoRepository.save(contenido);
        return MaterialDto.from(material);
    }

    public MaterialDto editar(Long id, MaterialRenombrarRequest request, Authentication authentication) {
        Material material = materialPropio(id, authentication);
        material.setTitulo(request.titulo().trim());
        if (material.esArchivo()) {
            // A un archivo no se le puede poner enlace: dejaría de ser "uno u otro".
            if (request.url() != null && !request.url().isBlank()) {
                throw new IllegalArgumentException("Un material que es un archivo no puede tener enlace");
            }
        } else {
            material.setUrl(Enlaces.httpsObligatorio(request.url()));
        }
        return MaterialDto.from(material);
    }

    public void eliminarMaterial(Long id, Authentication authentication) {
        Material material = materialPropio(id, authentication);
        archivoRepository.borrarDeMaterial(id);
        materialRepository.delete(material);
    }

    /** Descarga para cualquier miembro del espacio. Un enlace no se descarga: se abre. */
    @Transactional(readOnly = true)
    public ArchivoDescarga descargar(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Material material = buscarMaterial(id);
        areaService.buscarComoMiembro(material.getCarpeta().getArea().getId(), usuario);

        if (!material.esArchivo()) {
            throw new IllegalArgumentException("Este material es un enlace, no un archivo");
        }
        ArchivoMaterial contenido = archivoRepository.findByMaterialId(id)
            .orElseThrow(() -> new NotFoundException("El archivo de este material no está cargado"));
        return new ArchivoDescarga(contenido.getContenido(), material.getArchivoNombre(), material.getArchivoTipo());
    }

    public record ArchivoDescarga(byte[] contenido, String nombre, String tipo) {
    }

    // ------------------------------------------------------------------- helpers

    private Area areaPropia(Long areaId, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        return areaService.buscarPropia(areaId, usuario);
    }

    private CarpetaMaterial carpetaPropia(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        CarpetaMaterial carpeta = carpetaRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Carpeta no encontrada"));
        areaService.buscarPropia(carpeta.getArea().getId(), usuario);
        return carpeta;
    }

    private Material materialPropio(Long id, Authentication authentication) {
        User usuario = acceso.usuarioActual(authentication);
        Material material = buscarMaterial(id);
        areaService.buscarPropia(material.getCarpeta().getArea().getId(), usuario);
        return material;
    }

    private Material buscarMaterial(Long id) {
        return materialRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Material no encontrado"));
    }

    private void verificarNombreLibre(Long areaId, String nombre) {
        if (carpetaRepository.existsByAreaIdAndNombreIgnoreCase(areaId, nombre)) {
            throw new IllegalArgumentException("Ya tenés una carpeta con ese nombre en este espacio");
        }
    }

    /**
     * El nombre con el que se guarda el archivo. Algunos navegadores mandan la ruta
     * completa del equipo ({@code C:\Users\...\tesis.pdf}), que no es de nadie más;
     * se queda solo con el último tramo.
     */
    static String nombreSeguro(String original) {
        String nombre = original == null ? "" : original;
        int corte = Math.max(nombre.lastIndexOf('/'), nombre.lastIndexOf('\\'));
        nombre = nombre.substring(corte + 1).replaceAll("\\p{Cntrl}", "").trim();
        if (nombre.isEmpty()) {
            nombre = "material";
        }
        return nombre.length() > 255 ? nombre.substring(nombre.length() - 255) : nombre;
    }

    private static String quitarExtension(String nombre) {
        int punto = nombre.lastIndexOf('.');
        String base = punto > 0 ? nombre.substring(0, punto) : nombre;
        return base.length() > 160 ? base.substring(0, 160) : base;
    }
}
