package com.lumen.backend.infrastructure.persistence.repository;

import com.lumen.backend.infrastructure.persistence.entity.BudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetJpaRepository extends JpaRepository<BudgetEntity, UUID> {
    List<BudgetEntity> findByUserId(UUID userId);

    Optional<BudgetEntity> findByUserIdAndCategoryIdAndPeriod(UUID userId, UUID categoryId, String period);
}
