package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.service.RecurrenteService;
import com.lumen.backend.domain.model.Recurring;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recurrings")
@RequiredArgsConstructor
public class RecurrenteController {

    private final RecurrenteService recurrenteService;

    public record RecurrenteRequest(
            String name, Integer amount, UUID category_id, UUID account_id,
            String frequency, Instant start_date, Instant next_charge_date,
            Boolean active, Integer installment_total, Integer installment_current) {
        Recurring aDominio() {
            return Recurring.builder()
                    .name(name)
                    .amount(amount != null ? amount : 0)
                    .categoryId(category_id)
                    .accountId(account_id)
                    .frequency(frequency)
                    .startDate(start_date)
                    .nextChargeDate(next_charge_date)
                    .active(active == null || active)
                    .installmentTotal(installment_total)
                    .installmentCurrent(installment_current)
                    .build();
        }

        RecurrenteService.Cambios aCambios() {
            return new RecurrenteService.Cambios(
                    name, amount, category_id, account_id, frequency,
                    start_date, next_charge_date, active, installment_total);
        }
    }

    @GetMapping
    public List<Recurring> listar(@AuthenticationPrincipal UUID userId) {
        return recurrenteService.listar(userId);
    }

    @PostMapping
    public Recurring crear(@AuthenticationPrincipal UUID userId, @RequestBody RecurrenteRequest body) {
        return recurrenteService.crear(userId, body.aDominio());
    }

    @PatchMapping("/{id}")
    public Recurring editar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody RecurrenteRequest body) {
        return recurrenteService.editar(userId, id, body.aCambios());
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        recurrenteService.eliminar(userId, id);
        return Map.of("ok", true);
    }

    @PostMapping("/{id}/pause")
    public Recurring pausar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return recurrenteService.pausar(userId, id);
    }
}
