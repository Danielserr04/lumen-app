package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.common.Periodo;
import com.lumen.backend.application.service.PresupuestoService;
import com.lumen.backend.domain.model.Budget;
import com.lumen.backend.domain.model.BudgetDerivado;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class PresupuestoController {

    private final PresupuestoService presupuestoService;

    public record PresupuestoRequest(UUID category_id, Integer limit_amount, String period, Double alert_threshold) {}

    @GetMapping
    public List<BudgetDerivado> listar(@AuthenticationPrincipal UUID userId, @RequestParam(required = false) String period) {
        return presupuestoService.calcularDerivados(userId, period != null ? period : Periodo.actual());
    }

    @PostMapping
    public Budget crear(@AuthenticationPrincipal UUID userId, @RequestBody PresupuestoRequest body) {
        return presupuestoService.crear(userId, body.category_id(), body.limit_amount() != null ? body.limit_amount() : 0, body.period(), body.alert_threshold());
    }

    @PatchMapping("/{id}")
    public Budget editar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody PresupuestoRequest body) {
        return presupuestoService.editar(userId, id, body.limit_amount(), body.alert_threshold());
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        presupuestoService.eliminar(userId, id);
        return Map.of("ok", true);
    }
}
