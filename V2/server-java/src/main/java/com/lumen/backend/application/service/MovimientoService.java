package com.lumen.backend.application.service;

import com.lumen.backend.application.common.Periodo;
import com.lumen.backend.application.port.out.TransactionRepositoryPort;
import com.lumen.backend.application.port.out.TransactionRepositoryPort.TransactionFiltro;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.BudgetDerivado;
import com.lumen.backend.domain.model.Category;
import com.lumen.backend.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * CRUD de movimientos (§11.1) + el efecto lateral que de verdad importa: recalcular el
 * presupuesto de la categoría afectada y disparar una alerta SOLO si el estado empeora —
 * puerto directo de recalcularYAlertar/estadoPresupuestoDeCategoria del backend Node
 * original (server/src/modules/movimientos/servicio.ts).
 */
@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final TransactionRepositoryPort transactionRepository;
    private final com.lumen.backend.application.port.out.CategoryRepositoryPort categoryRepository;
    private final PresupuestoService presupuestoService;
    private final NotificationService notificationService;

    public List<Transaction> listar(UUID userId, TransactionFiltro filtro) {
        return transactionRepository.listar(userId, filtro);
    }

    public Transaction obtener(UUID userId, UUID id) {
        Transaction tx = transactionRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Movimiento no encontrado"));
        comprobarPropiedad(tx, userId);
        return tx;
    }

    public Transaction crear(UUID userId, Transaction datos) {
        if (datos.getAmount() == 0) throw ApiException.badRequest("El importe no puede ser 0 €");
        String periodo = Periodo.de(datos.getDate() != null ? datos.getDate() : Instant.now());
        String estadoAntes = presupuestoService.estadoDeCategoria(userId, datos.getCategoryId(), periodo);

        Transaction nuevo = datos.toBuilder()
                .userId(userId)
                .currency("EUR")
                .status(datos.getStatus() != null ? datos.getStatus() : "cleared")
                .date(datos.getDate() != null ? datos.getDate() : Instant.now())
                .createdAt(Instant.now())
                .build();
        Transaction guardado = transactionRepository.guardar(nuevo);

        if (guardado.getAmount() < 0 && guardado.getCategoryId() != null) {
            recalcularYAlertar(userId, guardado.getCategoryId(), periodo, estadoAntes);
        }
        return guardado;
    }

    /**
     * Cambios de un PATCH parcial (§11.1). `presentes` son las claves que traía el JSON: hace
     * falta para distinguir "no venía nota" (se conserva) de "venía nota: null" (se borra),
     * que es justo lo que hace el formulario al vaciar el campo.
     */
    public record Cambios(
            UUID accountId, UUID categoryId, Integer amount, String name,
            Instant date, String method, String note, String status,
            Set<String> presentes) {

        boolean trae(String campo) {
            return presentes != null && presentes.contains(campo);
        }
    }

    public Transaction editar(UUID userId, UUID id, Cambios cambios) {
        Transaction original = transactionRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Movimiento no encontrado"));
        comprobarPropiedad(original, userId);
        if (cambios.amount() != null && cambios.amount() == 0) throw ApiException.badRequest("El importe no puede ser 0 €");

        String periodoAntes = Periodo.de(original.getDate());
        String estadoAntesCategoriaOriginal = presupuestoService.estadoDeCategoria(userId, original.getCategoryId(), periodoAntes);

        Transaction actualizado = original.toBuilder()
                .accountId(cambios.accountId() != null ? cambios.accountId() : original.getAccountId())
                .categoryId(cambios.categoryId() != null ? cambios.categoryId() : original.getCategoryId())
                .amount(cambios.amount() != null ? cambios.amount() : original.getAmount())
                .name(cambios.name() != null ? cambios.name() : original.getName())
                .note(cambios.trae("note") ? cambios.note() : original.getNote())
                .date(cambios.date() != null ? cambios.date() : original.getDate())
                .method(cambios.trae("method") ? cambios.method() : original.getMethod())
                .status(cambios.status() != null ? cambios.status() : original.getStatus())
                .build();
        actualizado = transactionRepository.guardar(actualizado);

        boolean categoriaCambio = !java.util.Objects.equals(original.getCategoryId(), actualizado.getCategoryId());
        if (original.getCategoryId() != null && categoriaCambio) {
            recalcularYAlertar(userId, original.getCategoryId(), periodoAntes, estadoAntesCategoriaOriginal);
        }
        if (actualizado.getAmount() < 0 && actualizado.getCategoryId() != null) {
            String periodoDespues = Periodo.de(actualizado.getDate());
            String estadoAntesNueva = categoriaCambio
                    ? presupuestoService.estadoDeCategoria(userId, actualizado.getCategoryId(), periodoDespues)
                    : estadoAntesCategoriaOriginal;
            recalcularYAlertar(userId, actualizado.getCategoryId(), periodoDespues, estadoAntesNueva);
        }
        return actualizado;
    }

    public void eliminar(UUID userId, UUID id) {
        Transaction tx = transactionRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Movimiento no encontrado"));
        comprobarPropiedad(tx, userId);
        transactionRepository.marcarBorrado(id);
    }

    public void restaurar(UUID userId, UUID id) {
        Transaction tx = transactionRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Movimiento no encontrado"));
        comprobarPropiedad(tx, userId);
        transactionRepository.restaurar(id);
    }

    public Transaction duplicar(UUID userId, UUID id) {
        Transaction original = transactionRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Movimiento no encontrado"));
        comprobarPropiedad(original, userId);
        Transaction copia = original.toBuilder()
                .id(null)
                .date(Instant.now())
                .createdAt(Instant.now())
                .build();
        return transactionRepository.guardar(copia);
    }

    private void recalcularYAlertar(UUID userId, UUID categoryId, String periodo, String estadoAntes) {
        List<BudgetDerivado> derivados = presupuestoService.calcularDerivados(userId, periodo);
        Optional<BudgetDerivado> derivadoOpt = derivados.stream().filter(b -> b.getCategoryId().equals(categoryId)).findFirst();
        if (derivadoOpt.isEmpty()) return;
        BudgetDerivado derivado = derivadoOpt.get();
        if (Periodo.ordenEstado(derivado.getState()) <= Periodo.ordenEstado(estadoAntes)) return;

        Category categoria = categoryRepository.buscarPorId(categoryId).orElse(null);
        String nombre = categoria != null ? categoria.getName() : "una categoría";

        if ("over".equals(derivado.getState())) {
            notificationService.registrar(NotificationService.Datos.builder()
                    .userId(userId)
                    .type("budget_alert")
                    .severity("error")
                    .title("Has superado tu presupuesto de " + nombre)
                    .body(String.format(com.lumen.backend.application.common.Formato.ES, "Llevas %.2f € de %.2f € en %s este mes.", derivado.getSpent() / 100.0, derivado.getLimitAmount() / 100.0, nombre))
                    .actionType("ver_presupuesto")
                    .actionTargetId(categoryId.toString())
                    .build());
        } else if ("warning".equals(derivado.getState())) {
            notificationService.registrar(NotificationService.Datos.builder()
                    .userId(userId)
                    .type("budget_alert")
                    .severity("warning")
                    .title("Cerca del límite en " + nombre)
                    .body(String.format(com.lumen.backend.application.common.Formato.ES, "Vas por el %.0f%% de tu presupuesto de %s este mes.", derivado.getPercent() * 100, nombre))
                    .actionType("ver_movimientos_categoria")
                    .actionTargetId(categoryId.toString())
                    .build());
        }
    }

    private void comprobarPropiedad(Transaction tx, UUID userId) {
        if (!tx.getUserId().equals(userId)) throw ApiException.notFound("Movimiento no encontrado");
    }
}
