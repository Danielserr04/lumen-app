package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Budget;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepositoryPort {
    List<Budget> listarPorUsuario(UUID userId);
    Optional<Budget> buscarPorId(UUID id);
    Optional<Budget> buscarActivo(UUID userId, UUID categoryId, String period);
    Budget guardar(Budget budget);
    void eliminar(UUID id);
}
