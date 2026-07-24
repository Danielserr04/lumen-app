package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.port.out.AccountRepositoryPort;
import com.lumen.backend.application.service.NotificationService;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class CuentaController {

    private final AccountRepositoryPort accountRepository;
    private final NotificationService notificationService;

    public record CuentaRequest(String name, String type, String bank_name, String mask, Integer balance) {}

    @GetMapping
    public List<Account> listar(@AuthenticationPrincipal UUID userId) {
        return accountRepository.listarPorUsuario(userId);
    }

    @GetMapping("/{id}")
    public Account obtener(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Account cuenta = accountRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Cuenta no encontrada"));
        comprobarPropiedad(cuenta, userId);
        return cuenta;
    }

    @PostMapping
    public Account crear(@AuthenticationPrincipal UUID userId, @RequestBody CuentaRequest body) {
        if (body.name() == null || body.type() == null) throw ApiException.badRequest("Nombre y tipo son obligatorios");
        Account cuenta = accountRepository.guardar(Account.builder()
                .userId(userId)
                .name(body.name())
                .type(body.type())
                .bankName(body.bank_name())
                .mask(body.mask())
                .balance(body.balance() != null ? body.balance() : 0)
                .connected(!"cash".equals(body.type()))
                .createdAt(Instant.now())
                .build());
        if (!"cash".equals(cuenta.getType())) {
            notificationService.registrar(NotificationService.Datos.builder()
                    .userId(userId)
                    .type("sync")
                    .severity("info")
                    .title((cuenta.getBankName() != null ? cuenta.getBankName() : cuenta.getName()) + " conectado")
                    .body("Ya puedes ver los movimientos de " + (cuenta.getBankName() != null ? cuenta.getBankName() : cuenta.getName()) + " en Lumen.")
                    .actionType("ver_analisis")
                    .build());
        }
        return cuenta;
    }

    @PatchMapping("/{id}")
    public Account editar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody CuentaRequest body) {
        Account cuenta = accountRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Cuenta no encontrada"));
        comprobarPropiedad(cuenta, userId);
        if (body.name() != null) cuenta.setName(body.name());
        if (body.bank_name() != null) cuenta.setBankName(body.bank_name());
        return accountRepository.guardar(cuenta);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Account cuenta = accountRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Cuenta no encontrada"));
        comprobarPropiedad(cuenta, userId);
        if (accountRepository.contarMovimientos(id) > 0) throw ApiException.conflict("La cuenta tiene movimientos asociados");
        accountRepository.eliminar(id);
        return Map.of("ok", true);
    }

    @PostMapping("/{id}/sync")
    public Account sincronizar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Account cuenta = accountRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Cuenta no encontrada"));
        comprobarPropiedad(cuenta, userId);
        cuenta.setLastSyncAt(Instant.now());
        Account actualizada = accountRepository.guardar(cuenta);
        notificationService.registrar(NotificationService.Datos.builder()
                .userId(userId)
                .type("sync")
                .severity("info")
                .title("Sincronización completada")
                .body((actualizada.getBankName() != null ? actualizada.getBankName() : actualizada.getName()) + " actualizado con tus últimos movimientos.")
                .actionType("ver_analisis")
                .build());
        return actualizada;
    }

    private void comprobarPropiedad(Account cuenta, UUID userId) {
        if (!cuenta.getUserId().equals(userId)) throw ApiException.notFound("Cuenta no encontrada");
    }
}
