package com.lumen.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "budgets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "limit_amount", nullable = false)
    private int limitAmount;

    @Column(nullable = false)
    private String period;

    @Column(name = "alert_threshold", nullable = false)
    private double alertThreshold;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;
}
