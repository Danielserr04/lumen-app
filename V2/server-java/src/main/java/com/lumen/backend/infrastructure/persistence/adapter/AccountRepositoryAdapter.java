package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.AccountRepositoryPort;
import com.lumen.backend.domain.model.Account;
import com.lumen.backend.infrastructure.persistence.entity.AccountEntity;
import com.lumen.backend.infrastructure.persistence.repository.AccountJpaRepository;
import com.lumen.backend.infrastructure.persistence.repository.TransactionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AccountRepositoryAdapter implements AccountRepositoryPort {

    private final AccountJpaRepository repository;
    private final TransactionJpaRepository transactionRepository;

    @Override
    public List<Account> listarPorUsuario(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtAsc(userId).stream().map(AccountRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<Account> buscarPorId(UUID id) {
        return repository.findById(id).map(AccountRepositoryAdapter::aDominio);
    }

    @Override
    public Account guardar(Account account) {
        return aDominio(repository.save(aEntidad(account)));
    }

    @Override
    public void eliminar(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public long contarMovimientos(UUID accountId) {
        return transactionRepository.countByAccountIdAndDeletedAtIsNull(accountId);
    }

    static Account aDominio(AccountEntity e) {
        return Account.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .name(e.getName())
                .type(e.getType())
                .bankName(e.getBankName())
                .mask(e.getMask())
                .balance(e.getBalance())
                .connected(e.isConnected())
                .lastSyncAt(e.getLastSyncAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    static AccountEntity aEntidad(Account a) {
        return AccountEntity.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .name(a.getName())
                .type(a.getType())
                .bankName(a.getBankName())
                .mask(a.getMask())
                .balance(a.getBalance())
                .isConnected(a.isConnected())
                .lastSyncAt(a.getLastSyncAt())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
