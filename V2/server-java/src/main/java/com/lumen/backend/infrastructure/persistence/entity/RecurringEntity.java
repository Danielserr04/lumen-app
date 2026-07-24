package com.lumen.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recurrings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private String frequency;

    @Column(name = "next_charge_date", nullable = false)
    private Instant nextChargeDate;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "installment_current")
    private Integer installmentCurrent;

    @Column(name = "installment_total")
    private Integer installmentTotal;
}
