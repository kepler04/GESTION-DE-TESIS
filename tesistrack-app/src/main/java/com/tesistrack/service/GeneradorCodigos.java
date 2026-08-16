package com.tesistrack.service;

import java.security.SecureRandom;
import java.util.function.Predicate;

import org.springframework.stereotype.Service;

/**
 * Genera los códigos de invitación de las áreas.
 *
 * El código se dicta y se copia a mano, así que el alfabeto excluye los
 * caracteres que se confunden al leerlos en voz alta o en una captura:
 * {@code 0/O}, {@code 1/I/L}, {@code 5/S}, {@code 8/B}, {@code 2/Z}.
 *
 * Con 28 símbolos y 6 posiciones hay ~482 millones de combinaciones. Junto con
 * el límite de consultas del endpoint que resuelve códigos, adivinar uno ajeno
 * es inviable.
 */
@Service
public class GeneradorCodigos {

    private static final String ALFABETO = "ACDEFGHJKMNPQRTUVWXY34679";
    private static final int LARGO = 6;
    private static final String PREFIJO = "TT-";
    private static final int INTENTOS = 20;

    private final SecureRandom random = new SecureRandom();

    /**
     * Devuelve un código libre según {@code estaTomado}.
     *
     * @throws IllegalStateException si tras varios intentos no encuentra uno libre,
     *     lo que indicaría que el espacio de códigos se agotó y hay que agrandarlo
     *     — mejor fallar ruidosamente que entrar en un bucle infinito.
     */
    public String generar(Predicate<String> estaTomado) {
        for (int i = 0; i < INTENTOS; i++) {
            String candidato = uno();
            if (!estaTomado.test(candidato)) {
                return candidato;
            }
        }
        throw new IllegalStateException("No se pudo generar un código de invitación libre");
    }

    private String uno() {
        StringBuilder sb = new StringBuilder(PREFIJO);
        for (int i = 0; i < LARGO; i++) {
            sb.append(ALFABETO.charAt(random.nextInt(ALFABETO.length())));
        }
        return sb.toString();
    }
}
