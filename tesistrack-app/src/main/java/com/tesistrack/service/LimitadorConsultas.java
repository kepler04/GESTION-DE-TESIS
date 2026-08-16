package com.tesistrack.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.tesistrack.config.TooManyRequestsException;

/**
 * Límite de consultas por ventana de tiempo, para endpoints públicos.
 *
 * Existe por un endpoint concreto: el que dice si un correo ya está registrado.
 * Ese dato ya se filtraba al enviar el registro ("El email ya está registrado"),
 * así que consultarlo antes no abre una fuga nueva — pero sí la abarataría si se
 * pudiera preguntar miles de veces por segundo. Con el límite, alguien que quiera
 * enumerar los correos de la plataforma tarda tanto que deja de valer la pena.
 *
 * Es en memoria y por instancia: alcanza para un despliegue de una sola máquina,
 * que es lo previsto (EC2/Beanstalk único). Si algún día hay varias instancias
 * detrás de un balanceador, esto hay que moverlo a Redis o al API Gateway.
 */
@Service
public class LimitadorConsultas {

    /** Suficiente para el uso normal de un formulario; muy poco para enumerar. */
    private static final int MAXIMO_POR_VENTANA = 10;
    private static final Duration VENTANA = Duration.ofMinutes(1);

    /** Corta el mapa antes de que crezca sin control con IPs distintas. */
    private static final int MAXIMO_CLAVES = 10_000;

    private record Contador(int usos, Instant expiraEn) {}

    private final Map<String, Contador> contadores = new ConcurrentHashMap<>();

    /**
     * Registra un uso para la clave dada.
     *
     * @throws TooManyRequestsException si ya se agotó la cuota de la ventana actual
     */
    public void registrarUso(String clave) {
        Instant ahora = Instant.now();

        if (contadores.size() > MAXIMO_CLAVES) {
            contadores.entrySet().removeIf(e -> e.getValue().expiraEn().isBefore(ahora));
        }

        Contador actualizado = contadores.compute(clave, (k, actual) -> {
            if (actual == null || actual.expiraEn().isBefore(ahora)) {
                return new Contador(1, ahora.plus(VENTANA));
            }
            return new Contador(actual.usos() + 1, actual.expiraEn());
        });

        if (actualizado.usos() > MAXIMO_POR_VENTANA) {
            throw new TooManyRequestsException("Demasiadas consultas. Esperá un momento y probá de nuevo.");
        }
    }
}
