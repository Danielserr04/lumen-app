package com.lumen.backend.application.service;

import com.lumen.backend.application.port.out.SavingsGoalRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.SavingsGoal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetaService {

    private final SavingsGoalRepositoryPort savingsGoalRepository;
    private final NotificationService notificationService;

    public List<SavingsGoal> listar(UUID userId) {
        return savingsGoalRepository.listarPorUsuario(userId);
    }

    public SavingsGoal crear(UUID userId, SavingsGoal datos) {
        if (datos.getName() == null || datos.getTargetAmount() == 0 || datos.getColor() == null || datos.getIcon() == null) {
            throw ApiException.badRequest("Nombre, importe objetivo, color e icono son obligatorios");
        }
        return savingsGoalRepository.guardar(datos.toBuilder()
                .userId(userId)
                .currentAmount(0)
                .createdAt(Instant.now())
                .build());
    }

    /**
     * Cambios de un PATCH parcial: null = el campo no venía en el JSON, no se toca.
     * `presentes` (las claves que traía el JSON) hace falta para `deadline`, porque una meta
     * sí puede quedarse sin fecha límite: si viene a null explícito, se borra.
     */
    public record Cambios(String name, Integer targetAmount, Instant deadline, String color, String icon,
                          Set<String> presentes) {

        boolean trae(String campo) {
            return presentes != null && presentes.contains(campo);
        }
    }

    public SavingsGoal editar(UUID userId, UUID id, Cambios cambios) {
        SavingsGoal meta = savingsGoalRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Meta no encontrada"));
        comprobarPropiedad(meta, userId);
        SavingsGoal actualizada = meta.toBuilder()
                .name(cambios.name() != null ? cambios.name() : meta.getName())
                .targetAmount(cambios.targetAmount() != null ? cambios.targetAmount() : meta.getTargetAmount())
                .deadline(cambios.trae("deadline") ? cambios.deadline() : meta.getDeadline())
                .color(cambios.color() != null ? cambios.color() : meta.getColor())
                .icon(cambios.icon() != null ? cambios.icon() : meta.getIcon())
                .build();
        return savingsGoalRepository.guardar(actualizada);
    }

    public void eliminar(UUID userId, UUID id) {
        SavingsGoal meta = savingsGoalRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Meta no encontrada"));
        comprobarPropiedad(meta, userId);
        savingsGoalRepository.eliminar(id);
    }

    public SavingsGoal aportar(UUID userId, UUID id, int importe) {
        SavingsGoal meta = savingsGoalRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Meta no encontrada"));
        comprobarPropiedad(meta, userId);
        int anterior = meta.getCurrentAmount();
        SavingsGoal actualizada = savingsGoalRepository.guardar(meta.toBuilder().currentAmount(anterior + importe).build());

        if (anterior < meta.getTargetAmount() && actualizada.getCurrentAmount() >= actualizada.getTargetAmount()) {
            notificationService.registrar(NotificationService.Datos.builder()
                    .userId(userId)
                    .type("insight")
                    .severity("info")
                    .title("Objetivo de ahorro cumplido")
                    .body("Has alcanzado tu meta \"" + actualizada.getName() + "\".")
                    .actionType("ver_meta")
                    .actionTargetId(actualizada.getId().toString())
                    .build());
        }
        return actualizada;
    }

    private void comprobarPropiedad(SavingsGoal meta, UUID userId) {
        if (!meta.getUserId().equals(userId)) throw ApiException.notFound("Meta no encontrada");
    }
}
