package com.tesistrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {

    /**
     * Recorta el email antes de validarlo.
     *
     * Bean Validation corre sobre el objeto ya construido, así que sin esto un
     * espacio pegado por el autocompletado hacía fallar el {@code @Email} con
     * "formato incorrecto" en vez de dejar entrar a alguien con la credencial
     * correcta. La contraseña no se toca: los espacios pueden ser parte de ella.
     */
    public LoginRequest {
        email = email == null ? null : email.trim();
    }
}
