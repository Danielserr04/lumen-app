package com.lumen.backend.infrastructure.persistence.repository;

import com.lumen.backend.infrastructure.persistence.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TransactionJpaRepository extends JpaRepository<TransactionEntity, UUID>, JpaSpecificationExecutor<TransactionEntity> {
    List<TransactionEntity> findByUserIdAndDateBetweenAndDeletedAtIsNull(UUID userId, Instant desde, Instant hasta);

    List<TransactionEntity> findByUserIdAndCategoryIdAndAmountLessThanAndDateBetweenAndDeletedAtIsNull(
            UUID userId, UUID categoryId, int amount, Instant desde, Instant hasta);

    List<TransactionEntity> findByUserIdAndNameAndAmountLessThanAndDeletedAtIsNull(UUID userId, String name, int amount);

    long countByCategoryIdAndDeletedAtIsNull(UUID categoryId);

    long countByAccountIdAndDeletedAtIsNull(UUID accountId);

    TransactionEntity findFirstByTransferIdAndIdNot(UUID transferId, UUID excludeId);
}
