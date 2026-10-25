package com.tesistrack.integracion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

/** Lo que un estudiante no ve ni toca de su clase ni de los otros grupos. */
class PermisosEstudianteTest extends IntegracionTest {

    Usuario profe, yo, otro;
    JsonNode clase;
    long miTesis, otraTesis, hitoOtro, entregaOtro;

    @BeforeEach
    void escenario() {
        profe = profesor("Profe Permisos");
        clase = crearClase(profe, "Clase");
        String codigo = clase.get("codigo").asString();
        yo = estudiante("Yo Estudiante");
        otro = estudiante("Otro Grupo");
        miTesis = crearTesisOk(yo, "Mía", codigo, false);
        otraTesis = crearTesisOk(otro, "Ajena", codigo, false);
        hitoOtro = post("/api/proyectos/" + otraTesis + "/hitos", profe, "{\"nombre\": \"Hito ajeno\"}").get("id").asLong();
        entregaOtro = post("/api/hitos/" + hitoOtro + "/entregas", otro, "{\"archivoNombre\": \"ajena.pdf\"}").get("id").asLong();
        post("/api/entregas/" + entregaOtro + "/observaciones", profe, "{\"descripcion\": \"Observación privada\"}");
    }

    @Test
    void noVeElCodigoNiElSeguimientoNiLaConfiguracion() {
        long id = clase.get("id").asLong();
        Respuesta espacio = get("/api/areas/" + id + "/espacio", yo);
        assertThat(espacio.status()).isEqualTo(200);
        assertThat(espacio.get("area").get("codigo").isNull()).isTrue();
        assertThat(espacio.get("propietario").asBoolean()).isFalse();
        assertThat(get("/api/areas/" + id + "/tablero", yo).status()).isEqualTo(403);
        assertThat(get("/api/areas/" + id + "/resumen", yo).status()).isIn(403, 404);
        assertThat(put("/api/areas/" + id, yo, "{\"nombre\": \"Mía ahora\"}").status()).isEqualTo(403);
        assertThat(put("/api/areas/" + id + "/tope", yo, "{\"tope\": 5}").status()).isEqualTo(403);
        assertThat(post("/api/areas/" + id + "/codigo", yo, null).status()).isEqualTo(403);
        assertThat(delete("/api/areas/" + id, yo).status()).isEqualTo(403);
        assertThat(get("/api/proyectos/" + miTesis, yo).toString()).doesNotContain(clase.get("codigo").asString());
    }

    @Test
    void enPersonasNoVeLosCorreosNiElSemaforoDeOtrosGrupos() {
        JsonNode personas = get("/api/areas/" + clase.get("id").asLong() + "/personas", yo).cuerpo();
        assertThat(personas.toString()).doesNotContain(otro.email()).contains(yo.email());
        for (JsonNode g : personas.get("grupos")) {
            if (!g.get("propio").asBoolean()) {
                assertThat(g.get("semaforo").isNull()).isTrue();
                assertThat(g.get("tema").isNull()).isTrue();
            }
        }
    }

    @Test
    void noVeEntregasObservacionesTareasNiElDashboardDeOtroGrupo() {
        assertThat(get("/api/proyectos/" + otraTesis, yo).status()).isEqualTo(403);
        assertThat(get("/api/proyectos/" + otraTesis + "/dashboard", yo).status()).isEqualTo(403);
        assertThat(get("/api/proyectos/" + otraTesis + "/hitos", yo).status()).isEqualTo(403);
        assertThat(get("/api/hitos/" + hitoOtro + "/entregas", yo).status()).isEqualTo(403);
        assertThat(get("/api/entregas/" + entregaOtro + "/observaciones", yo).status()).isEqualTo(403);
        assertThat(get("/api/entregas/" + entregaOtro + "/archivo", yo).status()).isIn(403, 404);
        assertThat(get("/api/proyectos/" + otraTesis + "/tareas", yo).status()).isEqualTo(403);
        assertThat(get("/api/proyectos/" + otraTesis + "/asesorias", yo).status()).isEqualTo(403);
        assertThat(post("/api/hitos/" + hitoOtro + "/entregas", yo, "{\"archivoNombre\": \"x.pdf\"}").status()).isEqualTo(403);
        assertThat(get("/api/proyectos/" + otraTesis + "/candidatos", yo).status()).isEqualTo(403);
        JsonNode mias = get("/api/proyectos", yo).cuerpo();
        assertThat(mias.size()).isEqualTo(1);
        assertThat(mias.get(0).get("id").asLong()).isEqualTo(miTesis);
    }

    @Test
    void elDashboardDelProfesorNoEsParaEstudiantes() {
        assertThat(get("/api/dashboard/asesor", yo).status()).isEqualTo(403);
    }
}
