package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Transaction;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepositoryPort {
    List<Transaction> listar(UUID userId, TransactionFiltro filtro);
    Optional<Transaction> buscarPorId(UUID id);
    Transaction guardar(Transaction transaction);
    void marcarBorrado(UUID id);
    void restaurar(UUID id);

    /** Movimientos "reales" del periodo (sin transferencias) — para resumen/by-category/top-merchants. */
    List<Transaction> listarDelPeriodo(UUID userId, Instant desde, Instant hasta);

    /** Gastos de una categoría en el periodo — para calcular spent de un presupuesto. */
    List<Transaction> listarGastosDeCategoriaEnPeriodo(UUID userId, UUID categoryId, Instant desde, Instant hasta);

    List<Transaction> listarPorComercio(UUID userId, String nombre);

    long contarPorCategoria(UUID categoryId);
    long contarPorCuenta(UUID accountId);

    Optional<Transaction> buscarOtraPataTransferencia(UUID transferId, UUID excluirId);

    record TransactionFiltro(
            Instant from,
            Instant to,
            UUID categoryId,
            UUID accountId,
            String type, // expense | income
            String status,
            String q,
            Boolean isRecurring
    ) {}
}
