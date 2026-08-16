package com.tesistrack.config;

/** Se superó el límite de consultas permitido para un endpoint público. */
public class TooManyRequestsException extends RuntimeException {

    public TooManyRequestsException(String message) {
        super(message);
    }
}
