package com.lumen.backend.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Nota pragmática: @JsonIgnore aquí es la única concesión de framework en el dominio —
 * evita una clase de respuesta aparte solo para no filtrar el hash de contraseña.
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private UUID id;
    private String email;
    @JsonIgnore
    private String passwordHash;
    private String name;
    private String avatarUrl;
    private String locale;
    private String currency;
    private String theme;
    private boolean avisosActivos;
    private Instant createdAt;
    private Instant updatedAt;
}
