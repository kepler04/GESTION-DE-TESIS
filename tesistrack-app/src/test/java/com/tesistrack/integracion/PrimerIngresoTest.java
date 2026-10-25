package com.tesistrack.integracion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

/** El asistente de primer ingreso del estudiante, por API (Decisión 29). */
class PrimerIngresoTest extends IntegracionTest {

    @Test
    void soloConTemaEntraALaClaseConSuProfesor() {
        Usuario profe = profesor("Profe Ingreso");
        JsonNode clase = crearClase(profe, "Taller");
        Usuario a = estudiante("Alumna Con Tema");

        Respuesta r = crearTesis(a, "Telemedicina rural", clase.get("codigo").asString(), false);

        assertThat(r.status()).isEqualTo(201);
        assertThat(r.get("titulo").asString()).isEqualTo("Telemedicina rural");
        assertThat(r.get("grupal").asBoolean()).isFalse();
        assertThat(r.get("asesor").get("id").asLong()).isEqualTo(profe.id());
        assertThat(r.get("area").get("id").asLong()).isEqualTo(clase.get("id").asLong());
        assertThat(r.get("area").get("codigo").isNull()).as("el código no viaja al estudiante").isTrue();
        assertThat(r.get("area").get("topeGrupo").asInt()).isEqualTo(3);
    }

    @Test
    void sinTemaQuedaPorDefinirYDespuesSeRegistra() {
        JsonNode clase = crearClase(profesor("Profe Tema"), "Seminario");
        Usuario b = estudiante("Alumno Sin Tema");

        Respuesta r = crearTesis(b, null, clase.get("codigo").asString(), false);
        assertThat(r.status()).isEqualTo(201);
        assertThat(r.get("titulo").isNull()).as("por definir = null").isTrue();
        long id = r.get("id").asLong();

        assertThat(crearTesis(estudiante("Espacios"), "   ", null, false).get("titulo").isNull())
            .as("un tema en blanco también queda por definir").isTrue();
        assertThat(jdbc.queryForObject("select count(*) from proyecto where titulo is not null and btrim(titulo) = ''", Integer.class))
            .as("nunca se guarda un título vacío").isZero();

        assertThat(put("/api/proyectos/" + id + "/tema", b, "{\"titulo\": \"  \"}").status()).isEqualTo(400);
        Respuesta tema = put("/api/proyectos/" + id + "/tema", b,
            "{\"titulo\": \" Redes de sensores IoT \", \"descripcion\": \"Detección de anomalías\"}");
        assertThat(tema.status()).isEqualTo(200);
        assertThat(tema.get("titulo").asString()).isEqualTo("Redes de sensores IoT");
        assertThat(tema.get("descripcion").asString()).isEqualTo("Detección de anomalías");
    }

    @Test
    void soloLosIntegrantesRegistranElTema() {
        Usuario b = estudiante("Dueña Tema");
        long id = crearTesisOk(b, null, null, false);
        String body = "{\"titulo\": \"Intruso\"}";
        assertThat(put("/api/proyectos/" + id + "/tema", estudiante("Otro Estudiante"), body).status()).isEqualTo(403);
        assertThat(put("/api/proyectos/" + id + "/tema", profesor("Profe Ajeno Tema"), body).status()).isEqualTo(403);
    }

    @Test
    void unEstudianteNoPuedeTenerDosGruposEnLaMismaClase() {
        JsonNode clase = crearClase(profesor("Profe Doble"), "Clase");
        Usuario a = estudiante("Alumna Doble");
        assertThat(crearTesis(a, "Primera", clase.get("codigo").asString(), false).status()).isEqualTo(201);

        Respuesta segunda = crearTesis(a, "Segunda", clase.get("codigo").asString(), true);
        assertThat(segunda.status()).isEqualTo(400);
        assertThat(segunda.get("error").asString()).contains("Ya estás en un grupo de esta clase");
    }

    @Test
    void sinCodigoLaTesisQuedaSinClaseYSePuedeSumarDespues() {
        Usuario profe = profesor("Profe Despues");
        JsonNode clase = crearClase(profe, "Taller tarde");
        Usuario s = estudiante("Sin Codigo");

        long id = crearTesisOk(s, null, null, false);
        assertThat(get("/api/proyectos/" + id, s).get("area").isNull()).isTrue();

        Respuesta unida = patch("/api/proyectos/" + id + "/unirse", s,
            "{\"codigo\": " + str(clase.get("codigo").asString().toLowerCase()) + "}");
        assertThat(unida.status()).isEqualTo(200);
        assertThat(unida.get("asesor").get("id").asLong()).isEqualTo(profe.id());
    }

    @Test
    void elegirProfesorPorNombreSoloEntreQuienesDanPrivadas() {
        Usuario conPrivadas = profesor("Profe Privadas");
        put("/api/auth/me/asesorias-privadas", conPrivadas, "{\"valor\": true}");
        Usuario sinPrivadas = profesor("Profe Solo Clases");
        put("/api/auth/me/asesorias-privadas", sinPrivadas, "{\"valor\": false}");
        Usuario s = estudiante("Busca Privada");

        JsonNode lista = get("/api/usuarios/asesores", s).cuerpo();
        assertThat(lista.findValuesAsString("name")).contains("Profe Privadas").doesNotContain("Profe Solo Clases");

        assertThat(post("/api/proyectos", s, "{\"titulo\": \"X\", \"asesorId\": " + sinPrivadas.id() + "}").status())
            .isEqualTo(400);
        assertThat(post("/api/proyectos", s, "{\"titulo\": \"X\", \"asesorId\": " + conPrivadas.id() + "}").status())
            .isEqualTo(201);
    }

    @Test
    void soloUnEstudianteCreaSuTesis() {
        assertThat(crearTesis(profesor("Profe Crea"), "No", null, false).status()).isEqualTo(403);
        assertThat(crearTesis(coordinador("Coord Crea"), "No", null, false).status()).isEqualTo(403);
    }
}
