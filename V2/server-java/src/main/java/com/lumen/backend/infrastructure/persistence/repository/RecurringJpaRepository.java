package com.lumen.backend.infrastructure.persistence.repository;

import com.lumen.backend.infrastructure.persistence.entity.RecurringEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface RecurringJpaRepository extends JpaRepository<RecurringEntity, UUID> {
    List<RecurringEntity> findByUserIdOrderByNextChargeDateAsc(UUID userId);

    List<RecurringEntity> findByUserIdAndActiveTrueOrderByNextChargeDateAsc(UUID userId);

    List<RecurringEntity> findByActiveTrueAndNextChargeDateLessThanEqual(Instant ahora);
}
