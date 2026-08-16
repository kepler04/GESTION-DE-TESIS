package com.tesistrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Identifica a otra persona por su correo, para sumarla a una tesis grupal. */
public record EmailRequest(@NotBlank @Email String email) {

    public EmailRequest {
        // Igual que en el registro: se recorta antes de que corra @Email, porque
        // Bean Validation trabaja sobre el record ya construido.
        email = email == null ? null : email.trim();
    }
}
