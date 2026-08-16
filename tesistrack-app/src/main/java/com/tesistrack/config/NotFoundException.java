package com.tesistrack.config;

/** Recurso inexistente. Lo traduce {@link ApiExceptionHandler} a un 404 JSON. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
