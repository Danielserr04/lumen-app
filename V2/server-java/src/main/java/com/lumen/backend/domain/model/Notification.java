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
public class Notification {
    private UUID id;
    private UUID userId;
    private String type; // budget_alert | sync | insight
    private String title;
    private String body;
    private UUID relatedTransactionId;
    private boolean read;
    private Instant createdAt;

    private String severity; // info | warning | error
    private String actionType;
    private String actionTargetId;
}
