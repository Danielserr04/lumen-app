package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.RecurringRepositoryPort;
import com.lumen.backend.domain.model.Recurring;
import com.lumen.backend.infrastructure.persistence.entity.RecurringEntity;
import com.lumen.backend.infrastructure.persistence.repository.RecurringJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RecurringRepositoryAdapter implements RecurringRepositoryPort {

    private final RecurringJpaRepository repository;

    @Override
    public List<Recurring> listarPorUsuario(UUID userId) {
        return repository.findByUserIdOrderByNextChargeDateAsc(userId).stream().map(RecurringRepositoryAdapter::aDominio).toList();
    }

    @Override
    public List<Recurring> listarActivosPorUsuario(UUID userId) {
        return repository.findByUserIdAndActiveTrueOrderByNextChargeDateAsc(userId).stream().map(RecurringRepositoryAdapter::aDominio).toList();
    }

    @Override
    public List<Recurring> listarActivosVencidos(Instant ahora) {
        return repository.findByActiveTrueAndNextChargeDateLessThanEqual(ahora).stream().map(RecurringRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<Recurring> buscarPorId(UUID id) {
        return repository.findById(id).map(RecurringRepositoryAdapter::aDominio);
    }

    @Override
    public Recurring guardar(Recurring recurring) {
        return aDominio(repository.save(aEntidad(recurring)));
    }

    @Override
    public void eliminar(UUID id) {
        repository.deleteById(id);
    }

    static Recurring aDominio(RecurringEntity e) {
        return Recurring.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .categoryId(e.getCategoryId())
                .accountId(e.getAccountId())
                .name(e.getName())
                .amount(e.getAmount())
                .frequency(e.getFrequency())
                .nextChargeDate(e.getNextChargeDate())
                .startDate(e.getStartDate())
                .active(e.isActive())
                .installmentCurrent(e.getInstallmentCurrent())
                .installmentTotal(e.getInstallmentTotal())
                .build();
    }

    static RecurringEntity aEntidad(Recurring r) {
        return RecurringEntity.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .categoryId(r.getCategoryId())
                .accountId(r.getAccountId())
                .name(r.getName())
                .amount(r.getAmount())
                .frequency(r.getFrequency())
                .nextChargeDate(r.getNextChargeDate())
                .startDate(r.getStartDate())
                .active(r.isActive())
                .installmentCurrent(r.getInstallmentCurrent())
                .installmentTotal(r.getInstallmentTotal())
                .build();
    }
}
