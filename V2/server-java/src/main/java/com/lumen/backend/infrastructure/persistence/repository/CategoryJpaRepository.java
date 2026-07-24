package com.lumen.backend.infrastructure.persistence.repository;

import com.lumen.backend.infrastructure.persistence.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, UUID> {
    List<CategoryEntity> findByUserIdIsNullOrUserIdOrderBySortOrderAsc(UUID userId);

    long countByIdAndUserIdIsNull(UUID id);
}
