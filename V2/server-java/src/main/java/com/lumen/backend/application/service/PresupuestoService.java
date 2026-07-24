package com.lumen.backend.application.service;

import com.lumen.backend.application.common.Periodo;
import com.lumen.backend.application.port.out.BudgetRepositoryPort;
import com.lumen.backend.application.port.out.TransactionRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.Budget;
import com.lumen.backend.domain.model.BudgetDerivado;
import com.lumen.backend.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Puerto de calcularPresupuestosDerivados (§11.2) — spent/available/percent/state por query, no almacenados. */
@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private final BudgetRepositoryPort budgetRepository;
    private final TransactionRepositoryPort transactionRepository;

    public List<BudgetDerivado> calcularDerivados(UUID userId, String periodo) {
        Periodo.Rango rango = Periodo.rangoDe(periodo);
        return budgetRepository.listarPorUsuario(userId).stream()
                .map(b -> derivarUno(b, rango))
                .toList();
    }

    public BudgetDerivado derivarUno(Budget presupuesto, Periodo.Rango rango) {
        List<Transaction> gastos = transactionRepository.listarGastosDeCategoriaEnPeriodo(
                presupuesto.getUserId(), presupuesto.getCategoryId(), rango.inicio(), rango.fin());
        int spent = Math.abs(gastos.stream().mapToInt(Transaction::getAmount).sum());
        double percent = presupuesto.getLimitAmount() > 0 ? (double) spent / presupuesto.getLimitAmount() : 0;
        String state = Periodo.estadoDePercent(percent, presupuesto.getAlertThreshold());
        return BudgetDerivado.de(presupuesto, spent, percent, state);
    }

    public String estadoDeCategoria(UUID userId, UUID categoryId, String periodo) {
        if (categoryId == null) return null;
        return calcularDerivados(userId, periodo).stream()
                .filter(b -> b.getCategoryId().equals(categoryId))
                .findFirst()
                .map(BudgetDerivado::getState)
                .orElse(null);
    }

    public Budget crear(UUID userId, UUID categoryId, int limitAmount, String period, Double alertThreshold) {
        if (categoryId == null || limitAmount <= 0) throw ApiException.badRequest("Categoría e importe límite son obligatorios");
        String periodoFinal = period != null ? period : "monthly";
        if (budgetRepository.buscarActivo(userId, categoryId, periodoFinal).isPresent()) {
            throw ApiException.conflict("Ya existe un presupuesto activo para esta categoría");
        }
        return budgetRepository.guardar(Budget.builder()
                .userId(userId)
                .categoryId(categoryId)
                .limitAmount(limitAmount)
                .period(periodoFinal)
                .alertThreshold(alertThreshold != null ? alertThreshold : 0.8)
                .startDate(Instant.now())
                .build());
    }

    public Budget editar(UUID userId, UUID id, Integer limitAmount, Double alertThreshold) {
        Budget presupuesto = budgetRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Presupuesto no encontrado"));
        if (!presupuesto.getUserId().equals(userId)) throw ApiException.notFound("Presupuesto no encontrado");
        if (limitAmount != null) presupuesto.setLimitAmount(limitAmount);
        if (alertThreshold != null) presupuesto.setAlertThreshold(alertThreshold);
        return budgetRepository.guardar(presupuesto);
    }

    public void eliminar(UUID userId, UUID id) {
        Budget presupuesto = budgetRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Presupuesto no encontrado"));
        if (!presupuesto.getUserId().equals(userId)) throw ApiException.notFound("Presupuesto no encontrado");
        budgetRepository.eliminar(id);
    }
}
