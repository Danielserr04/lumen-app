package com.lumen.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Budget {
    private UUID id;
    private UUID userId;
    private UUID categoryId;
    private int limitAmount;
    private String period;
    private double alertThreshold;
    private Instant startDate;
}
