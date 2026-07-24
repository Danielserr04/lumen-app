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
public class SavingsGoal {
    private UUID id;
    private UUID userId;
    private String name;
    private int targetAmount;
    private int currentAmount;
    private Instant deadline;
    private String color;
    private String icon;
    private Instant createdAt;
}
