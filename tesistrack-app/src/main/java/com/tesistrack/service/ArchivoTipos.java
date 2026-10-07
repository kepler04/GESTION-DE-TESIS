package com.tesistrack.service;

import java.util.Set;

/**
 * Qué es de verdad un archivo subido, según sus **bytes iniciales** (la firma) y no
 * según lo que declare quien lo sube.
 *
 * <p>El tipo que manda el navegador, y el nombre del archivo, los controla quien
 * sube: un HTML o un SVG con un {@code <script>} puede llegar como
 * {@code image/png}. Como los archivos se pueden previsualizar dentro de la
 * aplicación, el tipo guardado tiene que ser uno que el servidor comprobó.
 *
 * <p>Solo cinco tipos se reconocen y se previsualizan: PNG, JPEG, GIF, WebP y PDF.
 * <b>Todo lo demás</b> (SVG, HTML, Word, PowerPoint, cualquier cosa) se guarda como
 * {@code application/octet-stream}: se descarga, nunca se previsualiza.
 */
public final class ArchivoTipos {

    public static final String PNG = "image/png";
    public static final String JPEG = "image/jpeg";
    public static final String GIF = "image/gif";
    public static final String WEBP = "image/webp";
    public static final String PDF = "application/pdf";
    public static final String GENERICO = "application/octet-stream";

    /** Los únicos tipos que el visor abre. */
    public static final Set<String> PREVISUALIZABLES = Set.of(PNG, JPEG, GIF, WEBP, PDF);

    private ArchivoTipos() {
    }

    /**
     * El tipo verificado de este contenido: uno de los cinco reconocidos, o
     * {@link #GENERICO} si la firma no coincide con ninguno.
     */
    public static String verificar(byte[] bytes) {
        if (bytes == null) {
            return GENERICO;
        }
        if (empieza(bytes, 0, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A)) {
            return PNG;
        }
        if (empieza(bytes, 0, 0xFF, 0xD8, 0xFF)) {
            return JPEG;
        }
        if (empieza(bytes, 0, 'G', 'I', 'F', '8', '7', 'a') || empieza(bytes, 0, 'G', 'I', 'F', '8', '9', 'a')) {
            return GIF;
        }
        // WebP es un contenedor RIFF: "RIFF" + tamaño (4 bytes) + "WEBP".
        if (empieza(bytes, 0, 'R', 'I', 'F', 'F') && empieza(bytes, 8, 'W', 'E', 'B', 'P')) {
            return WEBP;
        }
        if (empieza(bytes, 0, '%', 'P', 'D', 'F', '-')) {
            return PDF;
        }
        return GENERICO;
    }

    public static boolean esPrevisualizable(String tipo) {
        return tipo != null && PREVISUALIZABLES.contains(tipo);
    }

    private static boolean empieza(byte[] bytes, int desde, int... firma) {
        if (bytes.length < desde + firma.length) {
            return false;
        }
        for (int i = 0; i < firma.length; i++) {
            if ((bytes[desde + i] & 0xFF) != firma[i]) {
                return false;
            }
        }
        return true;
    }
}
