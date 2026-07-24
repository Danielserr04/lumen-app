package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.TransactionRepositoryPort;
import com.lumen.backend.domain.model.Transaction;
import com.lumen.backend.infrastructure.persistence.entity.TransactionEntity;
import com.lumen.backend.infrastructure.persistence.repository.TransactionJpaRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TransactionRepositoryAdapter implements TransactionRepositoryPort {

    private final TransactionJpaRepository repository;

    @Override
    public List<Transaction> listar(UUID userId, TransactionFiltro filtro) {
        Specification<TransactionEntity> spec = (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            predicados.add(cb.equal(root.get("userId"), userId));
            predicados.add(cb.isNull(root.get("deletedAt")));
            if (filtro.from() != null) predicados.add(cb.greaterThanOrEqualTo(root.get("date"), filtro.from()));
            if (filtro.to() != null) predicados.add(cb.lessThanOrEqualTo(root.get("date"), filtro.to()));
            if (filtro.categoryId() != null) predicados.add(cb.equal(root.get("categoryId"), filtro.categoryId()));
            if (filtro.accountId() != null) predicados.add(cb.equal(root.get("accountId"), filtro.accountId()));
            if ("expense".equals(filtro.type())) predicados.add(cb.lessThan(root.get("amount"), 0));
            if ("income".equals(filtro.type())) predicados.add(cb.greaterThan(root.get("amount"), 0));
            if (filtro.status() != null) predicados.add(cb.equal(root.get("status"), filtro.status()));
            if (filtro.isRecurring() != null) predicados.add(cb.equal(root.get("isRecurring"), filtro.isRecurring()));
            if (filtro.q() != null && !filtro.q().isBlank()) {
                String like = "%" + filtro.q().toLowerCase() + "%";
                predicados.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("note"), "")), like)));
            }
            query.orderBy(cb.desc(root.get("date")));
            return cb.and(predicados.toArray(new Predicate[0]));
        };
        return repository.findAll(spec).stream().map(TransactionRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<Transaction> buscarPorId(UUID id) {
        return repository.findById(id).map(TransactionRepositoryAdapter::aDominio);
    }

    @Override
    public Transaction guardar(Transaction transaction) {
        return aDominio(repository.save(aEntidad(transaction)));
    }

    @Override
    public void marcarBorrado(UUID id) {
        repository.findById(id).ifPresent(e -> {
            e.setDeletedAt(Instant.now());
            repository.save(e);
        });
    }

    @Override
    public void restaurar(UUID id) {
        repository.findById(id).ifPresent(e -> {
            e.setDeletedAt(null);
            repository.save(e);
        });
    }

    @Override
    public List<Transaction> listarDelPeriodo(UUID userId, Instant desde, Instant hasta) {
        return repository.findByUserIdAndDateBetweenAndDeletedAtIsNull(userId, desde, hasta).stream()
                .map(TransactionRepositoryAdapter::aDominio).toList();
    }

    @Override
    public List<Transaction> listarGastosDeCategoriaEnPeriodo(UUID userId, UUID categoryId, Instant desde, Instant hasta) {
        return repository.findByUserIdAndCategoryIdAndAmountLessThanAndDateBetweenAndDeletedAtIsNull(userId, categoryId, 0, desde, hasta)
                .stream().map(TransactionRepositoryAdapter::aDominio).toList();
    }

    @Override
    public List<Transaction> listarPorComercio(UUID userId, String nombre) {
        return repository.findByUserIdAndNameAndAmountLessThanAndDeletedAtIsNull(userId, nombre, 0)
                .stream().map(TransactionRepositoryAdapter::aDominio).toList();
    }

    @Override
    public long contarPorCategoria(UUID categoryId) {
        return repository.countByCategoryIdAndDeletedAtIsNull(categoryId);
    }

    @Override
    public long contarPorCuenta(UUID accountId) {
        return repository.countByAccountIdAndDeletedAtIsNull(accountId);
    }

    @Override
    public Optional<Transaction> buscarOtraPataTransferencia(UUID transferId, UUID excluirId) {
        return Optional.ofNullable(repository.findFirstByTransferIdAndIdNot(transferId, excluirId)).map(TransactionRepositoryAdapter::aDominio);
    }

    static Transaction aDominio(TransactionEntity e) {
        return Transaction.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .accountId(e.getAccountId())
                .categoryId(e.getCategoryId())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .name(e.getName())
                .note(e.getNote())
                .date(e.getDate())
                .method(e.getMethod())
                .status(e.getStatus())
                .recurring(e.isRecurring())
                .recurringId(e.getRecurringId())
                .createdAt(e.getCreatedAt())
                .transferId(e.getTransferId())
                .refundOf(e.getRefundOf())
                .amountOriginal(e.getAmountOriginal())
                .currencyOriginal(e.getCurrencyOriginal())
                .fxRate(e.getFxRate())
                .installmentCurrent(e.getInstallmentCurrent())
                .installmentTotal(e.getInstallmentTotal())
                .deletedAt(e.getDeletedAt())
                .build();
    }

    static TransactionEntity aEntidad(Transaction t) {
        return TransactionEntity.builder()
                .id(t.getId())
                .userId(t.getUserId())
                .accountId(t.getAccountId())
                .categoryId(t.getCategoryId())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .name(t.getName())
                .note(t.getNote())
                .date(t.getDate())
                .method(t.getMethod())
                .status(t.getStatus())
                .isRecurring(t.isRecurring())
                .recurringId(t.getRecurringId())
                .createdAt(t.getCreatedAt())
                .transferId(t.getTransferId())
                .refundOf(t.getRefundOf())
                .amountOriginal(t.getAmountOriginal())
                .currencyOriginal(t.getCurrencyOriginal())
                .fxRate(t.getFxRate())
                .installmentCurrent(t.getInstallmentCurrent())
                .installmentTotal(t.getInstallmentTotal())
                .deletedAt(t.getDeletedAt())
                .build();
    }
}
