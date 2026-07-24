package com.lumen.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/** Budget + campos derivados (spent/available/percent/state) — no se almacenan, se calculan. */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDerivado {
    private UUID id;
    private UUID userId;
    private UUID categoryId;
    private int limitAmount;
    private String period;
    private double alertThreshold;
    private Instant startDate;
    private int spent;
    private int available;
    private double percent;
    private String state; // ok | warning | over

    public static BudgetDerivado de(Budget b, int spent, double percent, String state) {
        return BudgetDerivado.builder()
                .id(b.getId())
                .userId(b.getUserId())
                .categoryId(b.getCategoryId())
                .limitAmount(b.getLimitAmount())
                .period(b.getPeriod())
                .alertThreshold(b.getAlertThreshold())
                .startDate(b.getStartDate())
                .spent(spent)
                .available(b.getLimitAmount() - spent)
                .percent(percent)
                .state(state)
                .build();
    }
}
