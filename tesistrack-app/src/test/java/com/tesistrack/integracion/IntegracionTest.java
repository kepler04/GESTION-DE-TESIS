package com.tesistrack.integracion;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * Base de los tests de integración: la aplicación entera en un puerto aleatorio,
 * contra un PostgreSQL en Docker ({@link ContenedorPostgres}), y llamadas HTTP de
 * verdad con su JWT. Prueba lo mismo que un cliente: rutas, seguridad, validación,
 * JSON y base de datos juntos.
 *
 * <p>Cada test crea sus propios usuarios con correos únicos, así que no dependen del
 * orden ni se pisan entre sí aunque compartan la base.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(ContenedorPostgres.class)
public abstract class IntegracionTest {

    private static final AtomicInteger SECUENCIA = new AtomicInteger();
    protected static final ObjectMapper JSON = JsonMapper.builder().build();
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    @Value("${local.server.port}")
    private int puerto;

    @Autowired
    protected JdbcTemplate jdbc;

    /** Un usuario registrado, con su token. */
    protected record Usuario(Long id, String nombre, String email, String token) {
    }

    /** Una respuesta: el código y el cuerpo (null si no vino JSON). */
    protected record Respuesta(int status, JsonNode cuerpo) {
        public JsonNode get(String campo) {
            return cuerpo.get(campo);
        }
    }

    protected Usuario registrar(String nombre, String rol) {
        String email = nombre.toLowerCase().replace(' ', '.') + "." + SECUENCIA.incrementAndGet() + "."
            + UUID.randomUUID().toString().substring(0, 8) + "@test.tesistrack";
        Respuesta r = post("/api/auth/register", null, """
            {"name": "%s", "email": "%s", "password": "password123", "role": "%s", "aceptaPolitica": true}
            """.formatted(nombre, email, rol));
        if (r.status() != 200 && r.status() != 201) {
            throw new IllegalStateException("No se pudo registrar a " + nombre + ": " + r);
        }
        return new Usuario(r.get("user").get("id").asLong(), nombre, email, r.get("token").asString());
    }

    protected Usuario estudiante(String nombre) {
        return registrar(nombre, "ESTUDIANTE");
    }

    protected Usuario profesor(String nombre) {
        return registrar(nombre, "ASESOR");
    }

    /** El coordinador no se puede registrar por la API: se promueve por SQL, como en producción. */
    protected Usuario coordinador(String nombre) {
        Usuario u = registrar(nombre, "ESTUDIANTE");
        jdbc.update("update users set role = 'COORDINADOR' where id = ?", u.id());
        Respuesta login = post("/api/auth/login", null,
            "{\"email\": \"%s\", \"password\": \"password123\"}".formatted(u.email()));
        return new Usuario(u.id(), u.nombre(), u.email(), login.get("token").asString());
    }

    protected Respuesta get(String ruta, Usuario u) {
        return enviar("GET", ruta, u, null);
    }

    protected Respuesta post(String ruta, Usuario u, String json) {
        return enviar("POST", ruta, u, json);
    }

    protected Respuesta put(String ruta, Usuario u, String json) {
        return enviar("PUT", ruta, u, json);
    }

    protected Respuesta patch(String ruta, Usuario u, String json) {
        return enviar("PATCH", ruta, u, json);
    }

    protected Respuesta delete(String ruta, Usuario u) {
        return enviar("DELETE", ruta, u, null);
    }

    /** Una clase nueva del profesor: {@code id}, {@code nombre}, {@code codigo}. */
    protected JsonNode crearClase(Usuario profesor, String nombre) {
        Respuesta r = post("/api/areas", profesor, "{\"nombre\": " + str(nombre + " " + UUID.randomUUID().toString().substring(0, 6)) + "}");
        if (r.status() != 201 && r.status() != 200) {
            throw new IllegalStateException("No se pudo crear la clase: " + r);
        }
        return r.cuerpo();
    }

    /** Crea la tesis como el asistente: con o sin código, tema y modalidad. */
    protected Respuesta crearTesis(Usuario estudiante, String tema, String codigo, boolean grupal) {
        return post("/api/proyectos", estudiante, """
            {"titulo": %s, "codigoInvitacion": %s, "grupal": %s}
            """.formatted(str(tema), str(codigo), grupal));
    }

    protected long crearTesisOk(Usuario estudiante, String tema, String codigo, boolean grupal) {
        Respuesta r = crearTesis(estudiante, tema, codigo, grupal);
        if (r.status() != 201 && r.status() != 200) {
            throw new IllegalStateException("No se pudo crear la tesis: " + r);
        }
        return r.get("id").asLong();
    }

    /** Escapa un texto para meterlo en un JSON escrito a mano. */
    protected static String str(String texto) {
        return texto == null ? "null" : JSON.writeValueAsString(texto);
    }

    private Respuesta enviar(String metodo, String ruta, Usuario u, String json) {
        HttpRequest.Builder b = HttpRequest.newBuilder(URI.create("http://localhost:" + puerto + ruta))
            .header("Content-Type", "application/json")
            .method(metodo, json == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json));
        if (u != null) {
            b.header("Authorization", "Bearer " + u.token());
        }
        try {
            HttpResponse<String> r = HTTP.send(b.build(), HttpResponse.BodyHandlers.ofString());
            JsonNode cuerpo = null;
            if (r.body() != null && !r.body().isBlank()) {
                try {
                    cuerpo = JSON.readTree(r.body());
                } catch (RuntimeException e) {
                    cuerpo = null;
                }
            }
            return new Respuesta(r.statusCode(), cuerpo);
        } catch (java.io.IOException e) {
            throw new IllegalStateException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
