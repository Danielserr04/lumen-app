package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepositoryPort {
    Optional<User> buscarPorEmail(String email);
    Optional<User> buscarPorId(UUID id);
    User guardar(User user);
}
