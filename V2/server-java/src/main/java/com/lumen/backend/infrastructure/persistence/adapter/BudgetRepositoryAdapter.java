package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.BudgetRepositoryPort;
import com.lumen.backend.domain.model.Budget;
import com.lumen.backend.infrastructure.persistence.entity.BudgetEntity;
import com.lumen.backend.infrastructure.persistence.repository.BudgetJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BudgetRepositoryAdapter implements BudgetRepositoryPort {

    private final BudgetJpaRepository repository;

    @Override
    public List<Budget> listarPorUsuario(UUID userId) {
        return repository.findByUserId(userId).stream().map(BudgetRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<Budget> buscarPorId(UUID id) {
        return repository.findById(id).map(BudgetRepositoryAdapter::aDominio);
    }

    @Override
    public Optional<Budget> buscarActivo(UUID userId, UUID categoryId, String period) {
        return repository.findByUserIdAndCategoryIdAndPeriod(userId, categoryId, period).map(BudgetRepositoryAdapter::aDominio);
    }

    @Override
    public Budget guardar(Budget budget) {
        return aDominio(repository.save(aEntidad(budget)));
    }

    @Override
    public void eliminar(UUID id) {
        repository.deleteById(id);
    }

    static Budget aDominio(BudgetEntity e) {
        return Budget.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .categoryId(e.getCategoryId())
                .limitAmount(e.getLimitAmount())
                .period(e.getPeriod())
                .alertThreshold(e.getAlertThreshold())
                .startDate(e.getStartDate())
                .build();
    }

    static BudgetEntity aEntidad(Budget b) {
        return BudgetEntity.builder()
                .id(b.getId())
                .userId(b.getUserId())
                .categoryId(b.getCategoryId())
                .limitAmount(b.getLimitAmount())
                .period(b.getPeriod())
                .alertThreshold(b.getAlertThreshold())
                .startDate(b.getStartDate())
                .build();
    }
}
