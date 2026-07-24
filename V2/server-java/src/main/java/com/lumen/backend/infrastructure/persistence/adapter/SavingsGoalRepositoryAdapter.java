package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.SavingsGoalRepositoryPort;
import com.lumen.backend.domain.model.SavingsGoal;
import com.lumen.backend.infrastructure.persistence.entity.SavingsGoalEntity;
import com.lumen.backend.infrastructure.persistence.repository.SavingsGoalJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SavingsGoalRepositoryAdapter implements SavingsGoalRepositoryPort {

    private final SavingsGoalJpaRepository repository;

    @Override
    public List<SavingsGoal> listarPorUsuario(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(SavingsGoalRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<SavingsGoal> buscarPorId(UUID id) {
        return repository.findById(id).map(SavingsGoalRepositoryAdapter::aDominio);
    }

    @Override
    public SavingsGoal guardar(SavingsGoal goal) {
        return aDominio(repository.save(aEntidad(goal)));
    }

    @Override
    public void eliminar(UUID id) {
        repository.deleteById(id);
    }

    static SavingsGoal aDominio(SavingsGoalEntity e) {
        return SavingsGoal.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .name(e.getName())
                .targetAmount(e.getTargetAmount())
                .currentAmount(e.getCurrentAmount())
                .deadline(e.getDeadline())
                .color(e.getColor())
                .icon(e.getIcon())
                .createdAt(e.getCreatedAt())
                .build();
    }

    static SavingsGoalEntity aEntidad(SavingsGoal g) {
        return SavingsGoalEntity.builder()
                .id(g.getId())
                .userId(g.getUserId())
                .name(g.getName())
                .targetAmount(g.getTargetAmount())
                .currentAmount(g.getCurrentAmount())
                .deadline(g.getDeadline())
                .color(g.getColor())
                .icon(g.getIcon())
                .createdAt(g.getCreatedAt())
                .build();
    }
}
