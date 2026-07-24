package com.lumen.backend.application.common;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;

/** "YYYY-MM" — mismo criterio que src/lib/periodo.ts del frontend y lib/dinero.ts del Node original. */
public final class Periodo {
    private Periodo() {}

    public static String de(Instant fecha) {
        return YearMonth.from(fecha.atZone(ZoneOffset.UTC)).toString();
    }

    public static String actual() {
        return de(Instant.now());
    }

    public record Rango(Instant inicio, Instant fin) {}

    public static Rango rangoDe(String periodo) {
        YearMonth ym = YearMonth.parse(periodo);
        LocalDate primerDia = ym.atDay(1);
        LocalDate primerDiaSiguiente = ym.plusMonths(1).atDay(1);
        return new Rango(primerDia.atStartOfDay(ZoneOffset.UTC).toInstant(), primerDiaSiguiente.atStartOfDay(ZoneOffset.UTC).toInstant());
    }

    public static int ordenEstado(String estado) {
        if (estado == null) return 0;
        return switch (estado) {
            case "over" -> 2;
            case "warning" -> 1;
            default -> 0;
        };
    }

    public static String estadoDePercent(double percent, double umbral) {
        if (percent >= 1) return "over";
        if (percent >= umbral) return "warning";
        return "ok";
    }
}
