package com.lumen.backend.infrastructure.persistence.repository;

import com.lumen.backend.infrastructure.persistence.entity.SavingsGoalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavingsGoalJpaRepository extends JpaRepository<SavingsGoalEntity, UUID> {
    List<SavingsGoalEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
