package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.common.Periodo;
import com.lumen.backend.application.service.AnaliticaService;
import com.lumen.backend.domain.model.Recurring;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AnaliticaController {

    private final AnaliticaService analiticaService;

    @GetMapping("/summary")
    public AnaliticaService.ResumenMensual resumen(@AuthenticationPrincipal UUID userId, @RequestParam(required = false) String period) {
        return analiticaService.resumenMensual(userId, period != null ? period : Periodo.actual());
    }

    @GetMapping("/analytics/by-category")
    public List<AnaliticaService.GastoPorCategoria> gastoPorCategoria(@AuthenticationPrincipal UUID userId, @RequestParam(required = false) String period) {
        return analiticaService.gastoPorCategoria(userId, period != null ? period : Periodo.actual());
    }

    @GetMapping("/analytics/cashflow")
    public List<AnaliticaService.PuntoHistorico> cashflow(@AuthenticationPrincipal UUID userId, @RequestParam(required = false, defaultValue = "6") int range) {
        return analiticaService.cashflow(userId, range);
    }

    @GetMapping("/analytics/top-merchants")
    public List<AnaliticaService.ComercioFrecuente> topComercios(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false, defaultValue = "5") int limit) {
        return analiticaService.topComercios(userId, period != null ? period : Periodo.actual(), limit);
    }

    @GetMapping("/analytics/insights")
    public List<AnaliticaService.InsightAnalisis> insights(@AuthenticationPrincipal UUID userId, @RequestParam(required = false) String period) {
        return analiticaService.insights(userId, period != null ? period : Periodo.actual());
    }

    @GetMapping("/analytics/recurring-upcoming")
    public List<Recurring> recurrentesProximos(@AuthenticationPrincipal UUID userId) {
        return analiticaService.recurrentesProximos(userId);
    }

    @GetMapping("/reports/transaction/{id}")
    public AnaliticaService.InformeMovimiento informe(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return analiticaService.informeMovimiento(userId, id);
    }
}
