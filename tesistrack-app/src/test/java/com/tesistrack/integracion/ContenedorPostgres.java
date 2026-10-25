package com.tesistrack.integracion;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Un PostgreSQL 16 en Docker para los tests: el mismo motor que producción, con las
 * migraciones Flyway de verdad (índices parciales, CHECK, btrim…), que una base en
 * memoria no reproduciría.
 *
 * <p>{@code @ServiceConnection} le pasa la URL, el usuario y la clave a Spring. El
 * contexto de Spring se reutiliza entre clases de test con la misma configuración,
 * así que el contenedor arranca una sola vez por corrida.
 */
@TestConfiguration(proxyBeanMethods = false)
public class ContenedorPostgres {

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        return new PostgreSQLContainer(DockerImageName.parse("postgres:16"));
    }
}
