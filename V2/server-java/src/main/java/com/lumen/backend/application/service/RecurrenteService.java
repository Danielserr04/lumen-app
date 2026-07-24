package com.lumen.backend.application.service;

import com.lumen.backend.application.port.out.RecurringRepositoryPort;
import com.lumen.backend.application.port.out.TransactionRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.Recurring;
import com.lumen.backend.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecurrenteService {

    private final RecurringRepositoryPort recurringRepository;
    private final TransactionRepositoryPort transactionRepository;
    private final NotificationService notificationService;

    public List<Recurring> listar(UUID userId) {
        return recurringRepository.listarPorUsuario(userId);
    }

    /** Cambios de un PATCH parcial: null = el campo no venía en el JSON, no se toca. */
    public record Cambios(
            String name, Integer amount, UUID categoryId, UUID accountId, String frequency,
            Instant startDate, Instant nextChargeDate, Boolean active, Integer installmentTotal) {}

    public Recurring crear(UUID userId, Recurring datos) {
        if (datos.getName() == null || datos.getAmount() == 0 || datos.getCategoryId() == null
                || datos.getAccountId() == null || datos.getFrequency() == null || datos.getStartDate() == null) {
            throw ApiException.badRequest("Nombre, importe, categoría, cuenta, frecuencia y fecha de inicio son obligatorios");
        }
        Instant proximoCargo = datos.getNextChargeDate() != null ? datos.getNextChargeDate() : calcularProximoCargo(datos.getStartDate(), datos.getFrequency());
        // Financiación: si viene un total de cuotas, la primera aún no se ha cobrado (cuota 1 pendiente).
        Integer cuotaActual = datos.getInstallmentTotal() != null
                ? (datos.getInstallmentCurrent() != null ? datos.getInstallmentCurrent() : 1)
                : null;
        return recurringRepository.guardar(datos.toBuilder()
                .userId(userId)
                .nextChargeDate(proximoCargo)
                .active(true)
                .installmentCurrent(cuotaActual)
                .build());
    }

    public Recurring editar(UUID userId, UUID id, Cambios cambios) {
        Recurring original = recurringRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Recurrente no encontrado"));
        comprobarPropiedad(original, userId);
        if (cambios.amount() != null && cambios.amount() == 0) throw ApiException.badRequest("El importe no puede ser 0 €");

        Integer totalCuotas = cambios.installmentTotal() != null ? cambios.installmentTotal() : original.getInstallmentTotal();
        Recurring actualizado = original.toBuilder()
                .name(cambios.name() != null ? cambios.name() : original.getName())
                .amount(cambios.amount() != null ? cambios.amount() : original.getAmount())
                .categoryId(cambios.categoryId() != null ? cambios.categoryId() : original.getCategoryId())
                .accountId(cambios.accountId() != null ? cambios.accountId() : original.getAccountId())
                .frequency(cambios.frequency() != null ? cambios.frequency() : original.getFrequency())
                .startDate(cambios.startDate() != null ? cambios.startDate() : original.getStartDate())
                .nextChargeDate(cambios.nextChargeDate() != null ? cambios.nextChargeDate() : original.getNextChargeDate())
                .active(cambios.active() != null ? cambios.active() : original.isActive())
                .installmentTotal(totalCuotas)
                // Al convertir una suscripción en financiación hay que inicializar la cuota en curso.
                .installmentCurrent(totalCuotas != null && original.getInstallmentCurrent() == null ? 1 : original.getInstallmentCurrent())
                .build();
        return recurringRepository.guardar(actualizado);
    }

    public void eliminar(UUID userId, UUID id) {
        Recurring recurrente = recurringRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Recurrente no encontrado"));
        comprobarPropiedad(recurrente, userId);
        recurringRepository.eliminar(id);
    }

    public Recurring pausar(UUID userId, UUID id) {
        Recurring recurrente = recurringRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Recurrente no encontrado"));
        comprobarPropiedad(recurrente, userId);
        return recurringRepository.guardar(recurrente.toBuilder().active(!recurrente.isActive()).build());
    }

    /** Job (§11.3): genera Transaction, avanza next_charge_date y notifica `sync`. */
    public int ejecutarJob() {
        List<Recurring> pendientes = recurringRepository.listarActivosVencidos(Instant.now());
        for (Recurring r : pendientes) {
            Integer total = r.getInstallmentTotal();
            Integer cuotaCobrada = total != null ? (r.getInstallmentCurrent() != null ? r.getInstallmentCurrent() : 1) : null;

            Transaction tx = transactionRepository.guardar(Transaction.builder()
                    .userId(r.getUserId())
                    .accountId(r.getAccountId())
                    .categoryId(r.getCategoryId())
                    .amount(r.getAmount())
                    .currency("EUR")
                    .name(r.getName())
                    .date(r.getNextChargeDate())
                    .status("cleared")
                    .recurring(true)
                    .recurringId(r.getId())
                    .createdAt(Instant.now())
                    .installmentCurrent(cuotaCobrada)
                    .installmentTotal(total)
                    .build());

            // Una financiación se apaga sola al cobrar la última cuota; una suscripción sigue.
            var avance = r.toBuilder().nextChargeDate(calcularProximoCargo(r.getNextChargeDate(), r.getFrequency()));
            if (total != null && cuotaCobrada != null) {
                int siguiente = cuotaCobrada + 1;
                avance.installmentCurrent(siguiente).active(cuotaCobrada < total);
            }
            recurringRepository.guardar(avance.build());

            notificationService.registrar(NotificationService.Datos.builder()
                    .userId(r.getUserId())
                    .type("sync")
                    .severity("info")
                    .title(r.getName() + " se ha cobrado")
                    .body(String.format(com.lumen.backend.application.common.Formato.ES, "Cargo recurrente de %.2f € generado.", Math.abs(r.getAmount()) / 100.0))
                    .relatedTransactionId(tx.getId())
                    .actionType("ver_movimiento")
                    .actionTargetId(tx.getId().toString())
                    .build());
        }
        return pendientes.size();
    }

    public static Instant calcularProximoCargo(Instant inicio, String frecuencia) {
        ZonedDateTime fecha = inicio.atZone(ZoneOffset.UTC);
        fecha = switch (frecuencia) {
            case "weekly" -> fecha.plusWeeks(1);
            case "yearly" -> fecha.plusYears(1);
            default -> fecha.plusMonths(1);
        };
        return fecha.toInstant();
    }

    private void comprobarPropiedad(Recurring recurrente, UUID userId) {
        if (!recurrente.getUserId().equals(userId)) throw ApiException.notFound("Recurrente no encontrado");
    }
}
