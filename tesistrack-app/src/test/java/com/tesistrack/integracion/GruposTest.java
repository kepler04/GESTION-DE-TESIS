package com.tesistrack.integracion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

/**
 * Grupos de una clase con tope 2 (Decisión 30): el escenario del pedido. A trabaja
 * sola con tema, B solo sin tema, C crea un grupo, D se suma, y E encuentra el grupo
 * lleno.
 */
class GruposTest extends IntegracionTest {

    Usuario profe;
    JsonNode clase;
    String codigo;
    Usuario a, b, c, d, e;
    long tesisA, tesisB, grupoC;

    @BeforeEach
    void escenario() {
        profe = profesor("Profe Grupos");
        clase = crearClase(profe, "Tesis I");
        codigo = clase.get("codigo").asString();
        assertThat(put("/api/areas/" + clase.get("id").asLong() + "/tope", profe, "{\"tope\": 2}").status()).isEqualTo(200);
        a = estudiante("Ana Sola");
        b = estudiante("Beto Sin Tema");
        c = estudiante("Caro Grupo");
        d = estudiante("Dani Grupo");
        e = estudiante("Eli Tarde");
        tesisA = crearTesisOk(a, "Telemedicina", codigo, false);
        tesisB = crearTesisOk(b, null, codigo, false);
        grupoC = crearTesisOk(c, null, codigo, true);
    }

    private Respuesta unirme(Usuario quien, long grupo, String conCodigo) {
        return post("/api/proyectos/" + grupo + "/unirme", quien, "{\"codigo\": " + str(conCodigo) + "}");
    }

    @Test
    void quienTieneElCodigoVeSoloLosGruposAbiertosConCupoYSinCorreos() {
        Respuesta r = get("/api/areas/invitacion/" + codigo + "/grupos", e);
        assertThat(r.status()).isEqualTo(200);
        assertThat(r.cuerpo().size()).as("las tesis individuales de A y B no aparecen").isEqualTo(1);
        JsonNode g = r.cuerpo().get(0);
        assertThat(g.get("proyectoId").asLong()).isEqualTo(grupoC);
        assertThat(g.get("integrantes").get(0).asString()).isEqualTo("Caro Grupo");
        assertThat(g.get("tema").isNull()).isTrue();
        assertThat(g.get("tope").asInt()).isEqualTo(2);
        assertThat(g.get("cupos").asInt()).isEqualTo(1);
        assertThat(r.cuerpo().toString()).doesNotContain("@");
    }

    @Test
    void dSeUneYElGrupoQuedaLlenoParaE() {
        Respuesta union = unirme(d, grupoC, codigo);
        assertThat(union.status()).isEqualTo(200);
        assertThat(union.get("estudiantes").size()).isEqualTo(2);
        assertThat(union.get("asesor").get("id").asLong()).isEqualTo(profe.id());

        Respuesta lleno = unirme(e, grupoC, codigo);
        assertThat(lleno.status()).isEqualTo(400);
        assertThat(lleno.get("error").asString()).contains("El grupo está completo");
        assertThat(get("/api/areas/invitacion/" + codigo + "/grupos", e).cuerpo().get(0).get("cupos").asInt()).isZero();
    }

    @Test
    void noSePuedeEntrarAUnGrupoDeOtraClaseNiAUnaTesisIndividual() {
        JsonNode otra = crearClase(profesor("Profe Otra"), "Otra");
        assertThat(unirme(e, grupoC, otra.get("codigo").asString()).status())
            .as("el código de otra clase no abre este grupo").isEqualTo(403);
        assertThat(unirme(e, grupoC, "TT-NOEXIS").status()).isIn(400, 404);
        assertThat(unirme(e, tesisA, codigo).status())
            .as("una tesis individual no acepta compañeros aunque se pase su id").isEqualTo(403);
    }

    @Test
    void quienYaTieneGrupoEnLaClaseNoPuedeSumarseAOtro() {
        Respuesta r = unirme(a, grupoC, codigo);
        assertThat(r.status()).isEqualTo(400);
        assertThat(r.get("error").asString()).contains("Ya estás en un grupo de esta clase");
    }

    @Test
    void elProfesorYElCoordinadorNoSeUnenAGrupos() {
        assertThat(unirme(profe, grupoC, codigo).status()).isEqualTo(403);
        assertThat(unirme(coordinador("Coord Grupos"), grupoC, codigo).status()).isEqualTo(403);
        assertThat(get("/api/areas/invitacion/" + codigo + "/grupos", profe).status()).isEqualTo(403);
    }

    @Test
    void elTopeLoCambiaSoloElProfesorDeLaClaseYDentroDelRango() {
        long id = clase.get("id").asLong();
        assertThat(put("/api/areas/" + id + "/tope", c, "{\"tope\": 5}").status()).isEqualTo(403);
        assertThat(put("/api/areas/" + id + "/tope", profesor("Profe Intruso"), "{\"tope\": 5}").status()).isIn(403, 404);
        assertThat(put("/api/areas/" + id + "/tope", profe, "{\"tope\": 0}").status()).isEqualTo(400);
        assertThat(put("/api/areas/" + id + "/tope", profe, "{\"tope\": 11}").status()).isEqualTo(400);
        assertThat(put("/api/areas/" + id + "/tope", profe, "{\"tope\": 3}").get("topeGrupo").asInt()).isEqualTo(3);
        assertThat(unirme(e, grupoC, codigo).status()).as("con tope 3 vuelve a haber lugar").isEqualTo(200);
    }

    @Test
    void bajarElTopeNoSacaANadie() {
        unirme(d, grupoC, codigo);
        put("/api/areas/" + clase.get("id").asLong() + "/tope", profe, "{\"tope\": 1}");
        assertThat(get("/api/proyectos/" + grupoC, c).get("estudiantes").size()).isEqualTo(2);
        assertThat(unirme(e, grupoC, codigo).status()).isEqualTo(400);
    }

    @Test
    void sumarPorCorreoTambienRespetaCupoYUnGrupoPorClase() {
        unirme(d, grupoC, codigo);
        Respuesta lleno = post("/api/proyectos/" + grupoC + "/estudiantes", c, "{\"email\": " + str(e.email()) + "}");
        assertThat(lleno.status()).isEqualTo(400);

        long grupoNuevo = crearTesisOk(e, null, codigo, true);
        Respuesta otroGrupo = post("/api/proyectos/" + grupoNuevo + "/estudiantes", e, "{\"email\": " + str(a.email()) + "}");
        assertThat(otroGrupo.status()).isEqualTo(400);
        assertThat(otroGrupo.get("error").asString()).contains("ya está en otro grupo de esta clase");
    }

    @Test
    void unGrupoQueSuperaElTopeNoEntraALaClase() {
        Usuario x = estudiante("X Grande"), y = estudiante("Y Grande"), z = estudiante("Z Grande");
        long grande = crearTesisOk(x, "Grande", null, true);
        post("/api/proyectos/" + grande + "/estudiantes", x, "{\"email\": " + str(y.email()) + "}");
        post("/api/proyectos/" + grande + "/estudiantes", x, "{\"email\": " + str(z.email()) + "}");
        Respuesta r = patch("/api/proyectos/" + grande + "/unirse", x, "{\"codigo\": " + str(codigo) + "}");
        assertThat(r.status()).isEqualTo(400);
        assertThat(r.get("error").asString()).contains("admite hasta 2");
    }

    @Test
    void salirDelGrupoNuncaLoDejaVacio() {
        unirme(d, grupoC, codigo);
        assertThat(delete("/api/proyectos/" + grupoC + "/estudiantes/" + d.id(), d).status()).isEqualTo(200);
        assertThat(get("/api/proyectos/" + grupoC, c).get("estudiantes").size()).isEqualTo(1);
        assertThat(delete("/api/proyectos/" + grupoC + "/estudiantes/" + c.id(), c).status())
            .as("la última integrante no puede irse").isIn(400, 409);
        assertThat(get("/api/proyectos/" + grupoC, d).status()).as("quien salió ya no ve el grupo").isEqualTo(403);
    }
}
