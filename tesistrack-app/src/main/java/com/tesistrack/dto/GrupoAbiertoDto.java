package com.tesistrack.dto;

import java.util.List;

/**
 * Un grupo abierto de una clase, como lo ve quien acaba de entrar con el código
 * (Decisión 30): nombres de los integrantes, el tema si lo tienen y cuántos lugares
 * quedan. Sin correos ni avance: para elegir grupo no hace falta más.
 */
public record GrupoAbiertoDto(Long proyectoId, String tema, List<String> integrantes, int tope, int cupos) {
}
