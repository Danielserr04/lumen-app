package com.lumen.backend.application.service;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.lumen.backend.application.common.Periodo;
import com.lumen.backend.application.port.out.*;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.*;

/** §15: resumen mensual, gasto por categoría, cashflow, top comercios, insights, informe A–K. */
@Service
@RequiredArgsConstructor
public class AnaliticaService {

    private final TransactionRepositoryPort transactionRepository;
    private final AccountRepositoryPort accountRepository;
    private final CategoryRepositoryPort categoryRepository;
    private final BudgetRepositoryPort budgetRepository;
    private final RecurringRepositoryPort recurringRepository;
    private final PresupuestoService presupuestoService;

    /*
     * OJO con el naming: la app fija Jackson en SNAKE_CASE globalmente porque el contrato de
     * entidades del §8 va en snake_case (category_id, limit_amount…). Pero estos DTOs derivados
     * del §15 son nuestros, van en español camelCase y el frontend los consume tal cual
     * (resumen.porcentajeGastado, punto.balanceDisponible, media.mediaPorMes, informe.otraPata).
     * Sin este @JsonNaming saldrían como porcentaje_gastado/balance_disponible y las pantallas
     * de Dashboard, Análisis e Informe renderizarían NaN. Cubierto por ContratoJsonTest.
     */
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record ResumenMensual(String periodo, int ingresos, int gastos, int presupuestoTotal, int disponible, double porcentajeGastado, String estado) {}
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record GastoPorCategoria(Category categoria, int total, double porcentaje) {}
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record PuntoHistorico(String mes, String etiqueta, int ingresos, int gastos, int balanceDisponible) {}
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record ComercioFrecuente(String nombre, int total, int veces) {}
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record MediaComercio(int mediaPorMes, int visitasPorMes, int ticketMedio) {}
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record InsightAnalisis(String titulo, String cuerpo, String icono, String color) {}
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public record InformeMovimiento(
            Transaction transaccion, String variante, Account cuenta, Category categoria,
            BudgetDerivado presupuesto, MediaComercio media, Recurring recurrente,
            Transaction original, Transaction otraPata) {}

    public ResumenMensual resumenMensual(UUID userId, String periodo) {
        Periodo.Rango rango = Periodo.rangoDe(periodo);
        List<Transaction> txs = transactionRepository.listarDelPeriodo(userId, rango.inicio(), rango.fin()).stream()
                .filter(t -> t.getTransferId() == null).toList();
        int ingresos = txs.stream().filter(t -> t.getAmount() > 0).mapToInt(Transaction::getAmount).sum();
        int gastos = Math.abs(txs.stream().filter(t -> t.getAmount() < 0).mapToInt(Transaction::getAmount).sum());
        int presupuestoTotal = budgetRepository.listarPorUsuario(userId).stream().mapToInt(Budget::getLimitAmount).sum();
        int disponible = presupuestoTotal - gastos;
        double porcentajeGastado = presupuestoTotal > 0 ? (double) gastos / presupuestoTotal : 0;
        String estado = Periodo.estadoDePercent(porcentajeGastado, 0.8);
        return new ResumenMensual(periodo, ingresos, gastos, presupuestoTotal, disponible, porcentajeGastado, estado);
    }

    public List<GastoPorCategoria> gastoPorCategoria(UUID userId, String periodo) {
        Periodo.Rango rango = Periodo.rangoDe(periodo);
        List<Transaction> txs = transactionRepository.listarDelPeriodo(userId, rango.inicio(), rango.fin()).stream()
                .filter(t -> t.getAmount() < 0 && t.getCategoryId() != null).toList();
        int totalGeneral = Math.abs(txs.stream().mapToInt(Transaction::getAmount).sum());

        Map<UUID, Integer> porCategoria = new LinkedHashMap<>();
        for (Transaction t : txs) porCategoria.merge(t.getCategoryId(), Math.abs(t.getAmount()), Integer::sum);

        return porCategoria.entrySet().stream()
                .map(e -> {
                    Category cat = categoryRepository.buscarPorId(e.getKey()).orElse(null);
                    double porcentaje = totalGeneral > 0 ? (double) e.getValue() / totalGeneral : 0;
                    return new GastoPorCategoria(cat, e.getValue(), porcentaje);
                })
                .filter(g -> g.categoria() != null)
                .sorted(Comparator.comparingInt(GastoPorCategoria::total).reversed())
                .toList();
    }

    public List<PuntoHistorico> cashflow(UUID userId, int meses) {
        List<PuntoHistorico> resultado = new ArrayList<>();
        YearMonth actual = YearMonth.now(ZoneOffset.UTC);
        for (int i = meses - 1; i >= 0; i--) {
            YearMonth ym = actual.minusMonths(i);
            String periodo = ym.toString();
            ResumenMensual resumen = resumenMensual(userId, periodo);
            String etiqueta = ym.atDay(1).getMonth().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es-ES"));
            etiqueta = etiqueta.substring(0, 1).toUpperCase() + etiqueta.substring(1).replace(".", "");
            resultado.add(new PuntoHistorico(periodo, etiqueta, resumen.ingresos(), resumen.gastos(), resumen.disponible()));
        }
        return resultado;
    }

    public List<ComercioFrecuente> topComercios(UUID userId, String periodo, int limite) {
        Periodo.Rango rango = Periodo.rangoDe(periodo);
        List<Transaction> txs = transactionRepository.listarDelPeriodo(userId, rango.inicio(), rango.fin()).stream()
                .filter(t -> t.getAmount() < 0).toList();
        Map<String, int[]> porComercio = new LinkedHashMap<>(); // [total, veces]
        for (Transaction t : txs) {
            int[] actual = porComercio.computeIfAbsent(t.getName(), k -> new int[2]);
            actual[0] += Math.abs(t.getAmount());
            actual[1] += 1;
        }
        return porComercio.entrySet().stream()
                .map(e -> new ComercioFrecuente(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .sorted(Comparator.comparingInt(ComercioFrecuente::total).reversed())
                .limit(limite)
                .toList();
    }

    public MediaComercio mediaPorComercio(UUID userId, String nombre) {
        List<Transaction> txs = transactionRepository.listarPorComercio(userId, nombre);
        if (txs.isEmpty()) return new MediaComercio(0, 0, 0);
        long meses = txs.stream().map(t -> Periodo.de(t.getDate())).distinct().count();
        if (meses == 0) meses = 1;
        int total = Math.abs(txs.stream().mapToInt(Transaction::getAmount).sum());
        return new MediaComercio((int) (total / meses), (int) (txs.size() / meses), total / txs.size());
    }

    public List<InsightAnalisis> insights(UUID userId, String periodo) {
        List<InsightAnalisis> insights = new ArrayList<>();
        List<GastoPorCategoria> gastoPorCategoria = gastoPorCategoria(userId, periodo);
        List<BudgetDerivado> presupuestos = presupuestoService.calcularDerivados(userId, periodo);
        List<ComercioFrecuente> topComercios = topComercios(userId, periodo, 1);

        if (!gastoPorCategoria.isEmpty()) {
            GastoPorCategoria top = gastoPorCategoria.get(0);
            insights.add(new InsightAnalisis(
                    top.categoria().getName() + " es tu categoría con más peso",
                    String.format(com.lumen.backend.application.common.Formato.ES, "Representa el %.0f%% de tu gasto total este mes.", top.porcentaje() * 100),
                    "chart-pie-slice", top.categoria().getColor()));
        }

        Optional<BudgetDerivado> masAjustado = presupuestos.stream()
                .filter(b -> b.getSpent() > 0)
                .max(Comparator.comparingDouble(BudgetDerivado::getPercent));
        if (masAjustado.isPresent()) {
            BudgetDerivado b = masAjustado.get();
            Category cat = categoryRepository.buscarPorId(b.getCategoryId()).orElse(null);
            String nombre = cat != null ? cat.getName() : "una categoría";
            if ("over".equals(b.getState())) {
                insights.add(new InsightAnalisis(
                        "Has superado tu presupuesto de " + nombre,
                        String.format(com.lumen.backend.application.common.Formato.ES, "Llevas %.2f € de %.2f € este mes.", b.getSpent() / 100.0, b.getLimitAmount() / 100.0),
                        "warning", "#FF6B7A"));
            } else {
                insights.add(new InsightAnalisis(
                        "Tu presupuesto de " + nombre + " es el más ajustado",
                        String.format(com.lumen.backend.application.common.Formato.ES, "Llevas usado el %.0f%% este mes.", b.getPercent() * 100),
                        "warning", "#FFC24B"));
            }
        }

        if (!topComercios.isEmpty() && topComercios.get(0).veces() > 1) {
            ComercioFrecuente c = topComercios.get(0);
            insights.add(new InsightAnalisis(
                    c.nombre() + " es tu comercio más frecuente",
                    String.format(com.lumen.backend.application.common.Formato.ES, "%d visitas este mes · %.2f € en total.", c.veces(), c.total() / 100.0),
                    "storefront", "#B78CFF"));
        }
        return insights;
    }

    public List<Recurring> recurrentesProximos(UUID userId) {
        return recurringRepository.listarActivosPorUsuario(userId);
    }

    public InformeMovimiento informeMovimiento(UUID userId, UUID id) {
        Transaction tx = transactionRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Movimiento no encontrado"));
        if (!tx.getUserId().equals(userId)) throw ApiException.notFound("Movimiento no encontrado");

        String variante = resolverVariante(userId, tx);
        Account cuenta = accountRepository.buscarPorId(tx.getAccountId()).orElse(null);
        Category categoria = tx.getCategoryId() != null ? categoryRepository.buscarPorId(tx.getCategoryId()).orElse(null) : null;
        MediaComercio media = mediaPorComercio(userId, tx.getName());

        BudgetDerivado presupuesto = null;
        if (tx.getCategoryId() != null) {
            presupuesto = presupuestoService.calcularDerivados(userId, Periodo.de(tx.getDate())).stream()
                    .filter(b -> b.getCategoryId().equals(tx.getCategoryId())).findFirst().orElse(null);
        }

        Recurring recurrente = tx.getRecurringId() != null ? recurringRepository.buscarPorId(tx.getRecurringId()).orElse(null) : null;
        Transaction original = tx.getRefundOf() != null ? transactionRepository.buscarPorId(tx.getRefundOf()).orElse(null) : null;
        Transaction otraPata = tx.getTransferId() != null
                ? transactionRepository.buscarOtraPataTransferencia(tx.getTransferId(), tx.getId()).orElse(null) : null;

        return new InformeMovimiento(tx, variante, cuenta, categoria, presupuesto, media, recurrente, original, otraPata);
    }

    /** Puerto directo de resolverVarianteInforme (src/lib/derivar.ts del frontend). */
    private String resolverVariante(UUID userId, Transaction tx) {
        if (tx.getTransferId() != null) return "E";
        if (tx.getRefundOf() != null) return "G";
        if ("pending".equals(tx.getStatus())) return "D";
        if (tx.getCategoryId() == null) return "H";
        if (tx.getInstallmentTotal() != null) return "K";
        if (tx.getAmountOriginal() != null && tx.getCurrencyOriginal() != null && !tx.getCurrencyOriginal().equals(tx.getCurrency())) return "I";
        Account cuenta = accountRepository.buscarPorId(tx.getAccountId()).orElse(null);
        if (cuenta != null && "cash".equals(cuenta.getType())) return "J";
        if (tx.getAmount() > 0) return "B";
        if (tx.isRecurring()) return "C";
        Optional<BudgetDerivado> presupuestoCategoria = presupuestoService.calcularDerivados(userId, Periodo.de(tx.getDate())).stream()
                .filter(b -> b.getCategoryId().equals(tx.getCategoryId())).findFirst();
        if (presupuestoCategoria.isPresent() && "over".equals(presupuestoCategoria.get().getState())) return "F";
        return "A";
    }
}
