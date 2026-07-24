package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.SavingsGoal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavingsGoalRepositoryPort {
    List<SavingsGoal> listarPorUsuario(UUID userId);
    Optional<SavingsGoal> buscarPorId(UUID id);
    SavingsGoal guardar(SavingsGoal goal);
    void eliminar(UUID id);
}
