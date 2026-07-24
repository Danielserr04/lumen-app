package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.service.MetaService;
import com.lumen.backend.domain.model.SavingsGoal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
public class MetaController {

    private final MetaService metaService;
    private final ObjectMapper objectMapper;

    public record MetaRequest(String name, Integer target_amount, Instant deadline, String color, String icon) {
        SavingsGoal aDominio() {
            return SavingsGoal.builder()
                    .name(name)
                    .targetAmount(target_amount != null ? target_amount : 0)
                    .deadline(deadline)
                    .color(color)
                    .icon(icon)
                    .build();
        }

        MetaService.Cambios aCambios(Set<String> presentes) {
            return new MetaService.Cambios(name, target_amount, deadline, color, icon, presentes);
        }
    }

    public record AportarRequest(Integer amount) {}

    @GetMapping
    public List<SavingsGoal> listar(@AuthenticationPrincipal UUID userId) {
        return metaService.listar(userId);
    }

    @PostMapping
    public SavingsGoal crear(@AuthenticationPrincipal UUID userId, @RequestBody MetaRequest body) {
        return metaService.crear(userId, body.aDominio());
    }

    @PatchMapping("/{id}")
    public SavingsGoal editar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody ObjectNode body) {
        MetaRequest datos = PatchBody.leer(objectMapper, body, MetaRequest.class);
        return metaService.editar(userId, id, datos.aCambios(PatchBody.campos(body)));
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        metaService.eliminar(userId, id);
        return Map.of("ok", true);
    }

    @PostMapping("/{id}/contribute")
    public SavingsGoal aportar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody AportarRequest body) {
        return metaService.aportar(userId, id, body.amount() != null ? body.amount() : 0);
    }
}
