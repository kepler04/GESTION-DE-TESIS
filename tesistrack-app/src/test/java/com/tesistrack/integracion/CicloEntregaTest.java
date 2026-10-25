package com.tesistrack.integracion;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;

/**
 * El ciclo completo de B, que arrancó sin tema: registra el tema, entrega, el
 * profesor observa, sube la versión corregida y se aprueba.
 */
class CicloEntregaTest extends IntegracionTest {

    @Test
    void entregaObservacionVersionCorregidaYAprobada() {
        Usuario profe = profesor("Profe Ciclo");
        JsonNode clase = crearClase(profe, "Ciclo");
        post("/api/areas/" + clase.get("id").asLong() + "/actividades", profe,
            "{\"nombre\": \"Hito 1: Plan\", \"fechaLimite\": \"2099-12-31\"}");
        Usuario b = estudiante("Beto Ciclo");
        long tesis = crearTesisOk(b, null, clase.get("codigo").asString(), false);

        JsonNode dash = get("/api/proyectos/" + tesis + "/dashboard", b).cuerpo();
        assertThat(dash.get("proyecto").get("titulo").isNull()).isTrue();
        assertThat(dash.get("semaforo").asString()).isEqualTo("VERDE");
        assertThat(put("/api/proyectos/" + tesis + "/tema", b, "{\"titulo\": \"Mi tema\"}").status()).isEqualTo(200);

        long hito = get("/api/proyectos/" + tesis + "/hitos", b).cuerpo().get(0).get("id").asLong();
        Respuesta v1 = post("/api/hitos/" + hito + "/entregas", b,
            "{\"archivoNombre\": \"plan_v1.pdf\", \"comentario\": \"primera\"}");
        assertThat(v1.status()).isEqualTo(201);
        assertThat(v1.get("estado").asString()).isEqualTo("EN_REVISION");

        Respuesta obs = post("/api/entregas/" + v1.get("id").asLong() + "/observaciones", profe,
            "{\"descripcion\": \"Falta justificar la muestra\"}");
        assertThat(obs.status()).isEqualTo(201);
        JsonNode trasObservar = get("/api/proyectos/" + tesis + "/dashboard", b).cuerpo();
        assertThat(trasObservar.get("semaforo").asString()).as("observado sin subsanar = en riesgo").isEqualTo("AMARILLO");
        JsonNode pendiente = trasObservar.get("observacionesPendientes").get(0);
        assertThat(pendiente.get("hitoId").asLong()).as("la observación lleva al hito para corregir").isEqualTo(hito);
        assertThat(get("/api/hitos/" + hito + "/entregas", b).cuerpo().get(0).get("estado").asString()).isEqualTo("OBSERVADA");

        Respuesta v2 = post("/api/hitos/" + hito + "/entregas", b,
            "{\"archivoNombre\": \"plan_v2.pdf\", \"comentario\": \"corregida\"}");
        assertThat(v2.get("version").asInt()).isEqualTo(2);
        assertThat(patch("/api/observaciones/" + obs.get("id").asLong() + "/estado", profe, "{\"estado\": \"RESUELTA\"}").status())
            .isEqualTo(200);
        assertThat(patch("/api/entregas/" + v2.get("id").asLong() + "/estado", profe, "{\"estado\": \"APROBADA\"}").get("estado").asString())
            .isEqualTo("APROBADA");
        assertThat(patch("/api/hitos/" + hito + "/estado", profe, "{\"estado\": \"COMPLETADO\"}").status()).isEqualTo(200);

        JsonNode fin = get("/api/proyectos/" + tesis + "/dashboard", b).cuerpo();
        assertThat(fin.get("observacionesPendientes").size()).isZero();
        assertThat(fin.get("semaforo").asString()).isEqualTo("VERDE");
        JsonNode versiones = get("/api/hitos/" + hito + "/entregas", b).cuerpo();
        assertThat(versiones.findValuesAsString("estado")).containsExactly("OBSERVADA", "APROBADA");
        assertThat(patch("/api/entregas/" + v2.get("id").asLong() + "/estado", b, "{\"estado\": \"APROBADA\"}").status())
            .as("el estudiante no se aprueba solo").isEqualTo(403);
    }
}
