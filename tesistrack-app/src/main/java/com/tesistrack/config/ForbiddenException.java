package com.tesistrack.config;

/**
 * El usuario está autenticado pero no tiene permiso sobre este recurso.
 * Lo traduce {@link ApiExceptionHandler} a un 403 JSON.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
