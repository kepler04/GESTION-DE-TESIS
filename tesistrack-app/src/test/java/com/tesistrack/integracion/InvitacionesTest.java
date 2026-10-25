package com.tesistrack.integracion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

/** Invitar a un compañero de la clase que trabaja solo, con aceptación (Decisión 31). */
class InvitacionesTest extends IntegracionTest {

    Usuario profe, c, a, b;
    JsonNode clase;
    String codigo;
    long grupoC, tesisA, tesisB;

    @BeforeEach
    void escenario() {
        profe = profesor("Profe Invita");
        clase = crearClase(profe, "Taller");
        codigo = clase.get("codigo").asString();
        c = estudiante("Caro Invita");
        a = estudiante("Ana Invitada");
        b = estudiante("Beto Con Entrega");
        grupoC = crearTesisOk(c, "Grupo de Caro", codigo, true);
        tesisA = crearTesisOk(a, null, codigo, false);
        tesisB = crearTesisOk(b, "La de Beto", codigo, false);
        // B ya entregó algo: no se lo puede invitar, porque aceptar le borraría su trabajo.
        long hito = post("/api/proyectos/" + tesisB + "/hitos", profe, "{\"nombre\": \"Plan\"}").get("id").asLong();
        assertThat(post("/api/hitos/" + hito + "/entregas", b, "{\"archivoNombre\": \"plan.pdf\"}").status()).isEqualTo(201);
    }

    private Respuesta invitar(Usuario quien, long grupo, Usuario aQuien) {
        return post("/api/proyectos/" + grupo + "/invitaciones", quien, "{\"estudianteId\": " + aQuien.id() + "}");
    }

    @Test
    void losCandidatosSonCompanerosQueTrabajanSolosYSinEntregas() {
        JsonNode cand = get("/api/proyectos/" + grupoC + "/candidatos", c).cuerpo();
        assertThat(cand.findValuesAsString("nombre")).containsExactly("Ana Invitada");
        assertThat(cand.toString()).doesNotContain("@");
        assertThat(invitar(c, grupoC, b).status()).isEqualTo(400);
    }

    @Test
    void invitarAceptarYLaTesisIndividualVaciaSeBorra() {
        Respuesta inv = invitar(c, grupoC, a);
        assertThat(inv.status()).isEqualTo(201);
        assertThat(invitar(c, grupoC, a).status()).as("no se duplica").isEqualTo(400);

        JsonNode recibidas = get("/api/invitaciones", a).cuerpo();
        assertThat(recibidas.size()).isEqualTo(1);
        assertThat(recibidas.get(0).get("invitador").asString()).isEqualTo("Caro Invita");
        assertThat(recibidas.get(0).get("tema").asString()).isEqualTo("Grupo de Caro");

        Respuesta ok = post("/api/invitaciones/" + inv.get("id").asLong() + "/aceptar", a, null);
        assertThat(ok.status()).isEqualTo(200);
        assertThat(ok.get("estudiantes").size()).isEqualTo(2);
        assertThat(get("/api/proyectos/" + tesisA, a).status()).as("la tesis individual vacía ya no existe").isEqualTo(404);
        assertThat(get("/api/invitaciones", a).cuerpo().size()).isZero();
        JsonNode mias = get("/api/proyectos", a).cuerpo();
        assertThat(mias.size()).isEqualTo(1);
        assertThat(mias.get(0).get("id").asLong()).isEqualTo(grupoC);
    }

    @Test
    void rechazarYCancelar() {
        long inv = invitar(c, grupoC, a).get("id").asLong();
        assertThat(delete("/api/invitaciones/" + inv, estudiante("Metido")).status()).isEqualTo(403);
        assertThat(delete("/api/invitaciones/" + inv, a).status()).as("la invitada rechaza").isEqualTo(204);
        assertThat(get("/api/proyectos/" + tesisA, a).status()).as("rechazar no toca su tesis").isEqualTo(200);

        long otra = invitar(c, grupoC, a).get("id").asLong();
        assertThat(delete("/api/invitaciones/" + otra, c).status()).as("el grupo cancela").isEqualTo(204);
        assertThat(get("/api/proyectos/" + grupoC + "/invitaciones", c).cuerpo().size()).isZero();
    }

    @Test
    void siEntregaAlgoAntesDeAceptarNoPuedeAceptar() {
        long inv = invitar(c, grupoC, a).get("id").asLong();
        long hito = post("/api/proyectos/" + tesisA + "/hitos", profe, "{\"nombre\": \"Avance\"}").get("id").asLong();
        post("/api/hitos/" + hito + "/entregas", a, "{\"archivoNombre\": \"avance.pdf\"}");
        Respuesta r = post("/api/invitaciones/" + inv + "/aceptar", a, null);
        assertThat(r.status()).isEqualTo(400);
        assertThat(r.get("error").asString()).contains("ya tiene entregas");
        assertThat(get("/api/proyectos/" + tesisA, a).status()).isEqualTo(200);
    }

    @Test
    void unGrupoLlenoNoInvitaNiDejaAceptar() {
        long inv = invitar(c, grupoC, a).get("id").asLong();
        put("/api/areas/" + clase.get("id").asLong() + "/tope", profe, "{\"tope\": 1}");
        assertThat(post("/api/invitaciones/" + inv + "/aceptar", a, null).status()).isEqualTo(400);
        Usuario otro = estudiante("Otro Solo");
        crearTesisOk(otro, null, codigo, false);
        assertThat(invitar(c, grupoC, otro).status()).isEqualTo(400);
    }

    @Test
    void soloInvitaUnIntegranteYSoloAAlguienDeLaClase() {
        assertThat(invitar(a, grupoC, a).status()).as("alguien de afuera del grupo").isEqualTo(403);
        assertThat(invitar(profe, grupoC, a).status()).isEqualTo(403);
        Usuario deOtraClase = estudiante("De Otra Clase");
        crearTesisOk(deOtraClase, null, crearClase(profesor("Profe X"), "X").get("codigo").asString(), false);
        assertThat(invitar(c, grupoC, deOtraClase).status()).isEqualTo(400);
        assertThat(get("/api/proyectos/" + grupoC + "/candidatos", a).status()).isEqualTo(403);
    }

    @Test
    void soloLaInvitadaAcepta() {
        long inv = invitar(c, grupoC, a).get("id").asLong();
        assertThat(post("/api/invitaciones/" + inv + "/aceptar", b, null).status()).isEqualTo(403);
        assertThat(post("/api/invitaciones/" + inv + "/aceptar", c, null).status()).isEqualTo(403);
    }
}
