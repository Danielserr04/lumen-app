package com.lumen.backend.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    private UUID id;
    private UUID userId; // null = categoría de sistema/global
    private String name;
    private String icon;
    private String color;
    private String tint;
    private String kind; // expense | income
    @JsonProperty("is_system")
    private boolean system;
    private int sortOrder;
}
