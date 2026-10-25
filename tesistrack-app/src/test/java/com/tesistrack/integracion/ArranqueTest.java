package com.tesistrack.integracion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** La aplicación arranca contra un PostgreSQL vacío, Flyway aplica todo y la seguridad responde. */
class ArranqueTest extends IntegracionTest {

    @Test
    void lasMigracionesSeAplicanYElRegistroFunciona() {
        Integer migraciones = jdbc.queryForObject("select count(*) from flyway_schema_history where success", Integer.class);
        assertThat(migraciones).isGreaterThanOrEqualTo(4);
        Usuario u = estudiante("Ana Arranque");
        assertThat(get("/api/proyectos", u).status()).isEqualTo(200);
        assertThat(get("/api/proyectos", null).status()).isIn(401, 403);
    }
}
