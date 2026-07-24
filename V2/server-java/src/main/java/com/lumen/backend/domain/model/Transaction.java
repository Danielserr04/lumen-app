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
public class Transaction {
    private UUID id;
    private UUID userId;
    private UUID accountId;
    private UUID categoryId;
    private int amount; // con signo: negativo = gasto, positivo = ingreso. Céntimos.
    private String currency;
    private String name;
    private String note;
    private Instant date;
    private String method;
    private String status; // cleared | pending
    // El campo se llama "recurring" (no "isRecurring") a propósito: así su nombre implícito
    // coincide con el del getter isRecurring() y Jackson los fusiona en UNA sola propiedad,
    // renombrada aquí a is_recurring. Con el campo llamado isRecurring salían las dos claves
    // ("is_recurring" y "recurring") en cada respuesta. Cubierto por ContratoJsonTest.
    @JsonProperty("is_recurring")
    private boolean recurring;
    private UUID recurringId;
    private Instant createdAt;

    // Campos §16 — resuelven las variantes E, G, I, K del informe.
    private UUID transferId;
    private UUID refundOf;
    private Integer amountOriginal;
    private String currencyOriginal;
    private Double fxRate;
    private Integer installmentCurrent;
    private Integer installmentTotal;
    private Instant deletedAt;
}
