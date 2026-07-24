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
public class Recurring {
    private UUID id;
    private UUID userId;
    private UUID categoryId;
    private UUID accountId;
    private String name;
    private int amount;
    private String frequency; // monthly | weekly | yearly
    private Instant nextChargeDate;
    private Instant startDate;
    private boolean active;
    private Integer installmentCurrent;
    private Integer installmentTotal;
}
