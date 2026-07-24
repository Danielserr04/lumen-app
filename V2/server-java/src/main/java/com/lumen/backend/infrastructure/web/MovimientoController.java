package com.lumen.backend.infrastructure.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lumen.backend.application.port.out.TransactionRepositoryPort.TransactionFiltro;
import com.lumen.backend.application.service.MovimientoService;
import com.lumen.backend.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;
    private final ObjectMapper objectMapper;

    public record MovimientoRequest(
            UUID account_id, UUID category_id, Integer amount, String name,
            Instant date, String method, String note, String status
    ) {
        Transaction aDominio() {
            return Transaction.builder()
                    .accountId(account_id)
                    .categoryId(category_id)
                    .amount(amount != null ? amount : 0)
                    .name(name)
                    .date(date)
                    .method(method)
                    .note(note)
                    .status(status)
                    .build();
        }

        MovimientoService.Cambios aCambios(Set<String> presentes) {
            return new MovimientoService.Cambios(account_id, category_id, amount, name, date, method, note, status, presentes);
        }
    }

    @GetMapping
    public List<Transaction> listar(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(required = false) UUID category_id,
            @RequestParam(required = false) UUID account_id,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean is_recurring) {
        return movimientoService.listar(userId, new TransactionFiltro(from, to, category_id, account_id, type, status, q, is_recurring));
    }

    @GetMapping("/{id}")
    public Transaction obtener(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return movimientoService.obtener(userId, id);
    }

    @PostMapping
    public Transaction crear(@AuthenticationPrincipal UUID userId, @RequestBody MovimientoRequest body) {
        return movimientoService.crear(userId, body.aDominio());
    }

    @PatchMapping("/{id}")
    public Transaction editar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody ObjectNode body) {
        MovimientoRequest datos = PatchBody.leer(objectMapper, body, MovimientoRequest.class);
        return movimientoService.editar(userId, id, datos.aCambios(PatchBody.campos(body)));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        movimientoService.eliminar(userId, id);
    }

    @PostMapping("/{id}/restore")
    public void restaurar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        movimientoService.restaurar(userId, id);
    }

    @PostMapping("/{id}/duplicate")
    public Transaction duplicar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        return movimientoService.duplicar(userId, id);
    }
}
