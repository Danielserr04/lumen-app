package com.lumen.backend.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class Account {
    private UUID id;
    private UUID userId;
    private String name;
    private String type; // checking | card | cash
    private String bankName;
    private String mask;
    private int balance;
    // El campo se llama "connected" para que su nombre implícito coincida con el del getter
    // isConnected() y Jackson emita una única propiedad, renombrada a is_connected (ver la
    // nota equivalente en Transaction).
    @JsonProperty("is_connected")
    private boolean connected;
    private Instant lastSyncAt;
    private Instant createdAt;
}
