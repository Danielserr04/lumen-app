package com.lumen.backend.infrastructure.scheduling;

import com.lumen.backend.application.service.RecurrenteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Job de recurrentes (§11.3) — cada hora es sobrado para un MVP personal. */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecurrenteJob {

    private final RecurrenteService recurrenteService;

    @Scheduled(fixedRate = 60 * 60 * 1000, initialDelay = 5000)
    public void ejecutar() {
        int generados = recurrenteService.ejecutarJob();
        if (generados > 0) log.info("Job de recurrentes: {} cargo(s) generado(s)", generados);
    }
}
