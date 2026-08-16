package com.tesistrack.dto;

import com.tesistrack.model.Role;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Registro en dos pasos, pero un solo POST: el frontend junta las credenciales
 * (paso 1) y el perfil (paso 2), y recién al final llama acá. Así no quedan
 * cuentas a medio crear si alguien abandona el formulario.
 *
 * Los campos del perfil son opcionales salvo el nombre: hacerlos obligatorios
 * bloquearía el registro por datos que ninguna funcionalidad necesita todavía.
 */
public record RegisterRequest(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String password,
    @NotNull Role role,

    @Size(max = 40, message = "El teléfono es demasiado largo") String telefono,
    @Size(max = 120, message = "La ubicación es demasiado larga") String ubicacion,
    @Size(max = 120, message = "La carrera es demasiado larga") String carrera,
    @Size(max = 160, message = "La organización es demasiado larga") String organizacion,

    /** Sin esto no se crea la cuenta: es la prueba del consentimiento. */
    Boolean aceptaPolitica
) {

    /** Igual que en LoginRequest: se recorta antes de que corra el {@code @Email}. */
    public RegisterRequest {
        email = email == null ? null : email.trim();
    }

    @AssertTrue(message = "Tenés que aceptar la política de privacidad para crear la cuenta")
    public boolean isPoliticaAceptada() {
        return Boolean.TRUE.equals(aceptaPolitica);
    }
}
