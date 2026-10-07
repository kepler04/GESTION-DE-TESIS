package com.tesistrack.service;

/**
 * Validación de los enlaces que el asesor o el estudiante pegan a mano (la
 * videollamada de una reunión, un material de Drive).
 *
 * <p>Se exige {@code https://}: un enlace que llega a otros usuarios y se abre con
 * un clic no puede ser un {@code javascript:} ni un {@code http://} sin cifrar.
 * La base repite la regla con un {@code CHECK}, así que ni una escritura que se
 * salte este servicio puede guardar otra cosa.
 */
final class Enlaces {

    static final String ESQUEMA = "https://";
    static final int MAXIMO = 1000;

    private Enlaces() {
    }

    /**
     * El enlace normalizado (sin espacios en los extremos y con el esquema en
     * minúsculas), o {@code null} si vino vacío.
     *
     * @throws IllegalArgumentException si no es un {@code https://} bien formado
     */
    static String https(String bruto) {
        if (bruto == null || bruto.isBlank()) {
            return null;
        }
        String url = bruto.trim();
        if (url.length() > MAXIMO) {
            throw new IllegalArgumentException("El enlace es demasiado largo");
        }
        if (url.chars().anyMatch(Character::isWhitespace)) {
            throw new IllegalArgumentException("El enlace no puede tener blancos en el medio");
        }
        if (!url.regionMatches(true, 0, ESQUEMA, 0, ESQUEMA.length()) || url.length() == ESQUEMA.length()) {
            throw new IllegalArgumentException("El enlace tiene que empezar con https://");
        }
        return ESQUEMA + url.substring(ESQUEMA.length());
    }

    /** Igual que {@link #https(String)}, pero un enlace vacío tampoco se acepta. */
    static String httpsObligatorio(String bruto) {
        String url = https(bruto);
        if (url == null) {
            throw new IllegalArgumentException("Falta el enlace");
        }
        return url;
    }
}
