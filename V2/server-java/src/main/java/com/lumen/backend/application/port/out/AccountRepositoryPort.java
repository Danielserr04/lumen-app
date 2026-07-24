package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Account;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepositoryPort {
    List<Account> listarPorUsuario(UUID userId);
    Optional<Account> buscarPorId(UUID id);
    Account guardar(Account account);
    void eliminar(UUID id);
    long contarMovimientos(UUID accountId);
}
