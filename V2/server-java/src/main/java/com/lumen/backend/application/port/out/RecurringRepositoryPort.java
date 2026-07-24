package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Recurring;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringRepositoryPort {
    List<Recurring> listarPorUsuario(UUID userId);
    List<Recurring> listarActivosPorUsuario(UUID userId);
    List<Recurring> listarActivosVencidos(Instant ahora);
    Optional<Recurring> buscarPorId(UUID id);
    Recurring guardar(Recurring recurring);
    void eliminar(UUID id);
}
