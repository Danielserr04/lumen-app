package com.lumen.backend.infrastructure.persistence.repository;

import com.lumen.backend.infrastructure.persistence.entity.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AccountJpaRepository extends JpaRepository<AccountEntity, UUID> {
    List<AccountEntity> findByUserIdOrderByCreatedAtAsc(UUID userId);
}
