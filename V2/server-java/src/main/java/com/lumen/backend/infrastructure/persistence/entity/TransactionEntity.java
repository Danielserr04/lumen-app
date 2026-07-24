package com.lumen.backend.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(nullable = false)
    private int amount;

    @Column(nullable = false)
    private String currency;

    @Column(nullable = false)
    private String name;

    private String note;

    @Column(nullable = false)
    private Instant date;

    private String method;

    @Column(nullable = false)
    private String status;

    @Column(name = "is_recurring", nullable = false)
    private boolean isRecurring;

    @Column(name = "recurring_id")
    private UUID recurringId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "transfer_id")
    private UUID transferId;

    @Column(name = "refund_of")
    private UUID refundOf;

    @Column(name = "amount_original")
    private Integer amountOriginal;

    @Column(name = "currency_original")
    private String currencyOriginal;

    @Column(name = "fx_rate")
    private Double fxRate;

    @Column(name = "installment_current")
    private Integer installmentCurrent;

    @Column(name = "installment_total")
    private Integer installmentTotal;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
