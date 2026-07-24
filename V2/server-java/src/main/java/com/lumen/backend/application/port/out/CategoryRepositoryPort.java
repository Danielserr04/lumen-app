package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepositoryPort {
    List<Category> listarSistemaYDeUsuario(UUID userId);
    Optional<Category> buscarPorId(UUID id);
    Category guardar(Category category);
    void eliminar(UUID id);
}
