package com.lumen.backend.infrastructure.seed;

import com.lumen.backend.application.port.out.*;
import com.lumen.backend.domain.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Datos de ejemplo — puerto directo de server/prisma/seed.ts (backend Node original).
 * Solo se ejecuta con el perfil "seed" activo (mvn spring-boot:run -Dspring-boot.run.profiles=seed),
 * nunca automáticamente en producción.
 */
@Component
@Profile("seed")
@RequiredArgsConstructor
@Slf4j
public class SeedRunner implements CommandLineRunner {

    private final UserRepositoryPort userRepository;
    private final AccountRepositoryPort accountRepository;
    private final CategoryRepositoryPort categoryRepository;
    private final TransactionRepositoryPort transactionRepository;
    private final BudgetRepositoryPort budgetRepository;
    private final RecurringRepositoryPort recurringRepository;
    private final SavingsGoalRepositoryPort savingsGoalRepository;
    private final PasswordEncoder passwordEncoder;

    private record CategoriaSemilla(String name, String icon, String color, String tint, String kind) {}

    private static final List<CategoriaSemilla> CATEGORIAS = List.of(
            new CategoriaSemilla("Comida", "fork-knife", "#FFA35C", "255,163,92", "expense"),
            new CategoriaSemilla("Transporte", "car", "#5CB3FF", "92,179,255", "expense"),
            new CategoriaSemilla("Ocio", "confetti", "#B78CFF", "183,140,255", "expense"),
            new CategoriaSemilla("Suscripciones", "repeat", "#FF7FC4", "255,127,196", "expense"),
            new CategoriaSemilla("Salud", "heartbeat", "#4FD9D0", "79,217,208", "expense"),
            new CategoriaSemilla("Tabaco", "cigarette", "#B08968", "176,137,104", "expense"),
            new CategoriaSemilla("Otros", "dots-three", "#98A2B8", "152,162,184", "expense"),
            new CategoriaSemilla("Ingreso", "hand-coins", "#4ADEA8", "74,222,168", "income")
    );

    @Override
    public void run(String... args) {
        if (userRepository.buscarPorEmail("demo@lumen.app").isPresent()) {
            log.info("Seed: el usuario demo ya existe, no se repite.");
            return;
        }
        log.info("Sembrando datos de ejemplo…");

        List<Category> categorias = CATEGORIAS.stream()
                .map(c -> categoryRepository.guardar(Category.builder()
                        .name(c.name()).icon(c.icon()).color(c.color()).tint(c.tint()).kind(c.kind())
                        .system(true).sortOrder(CATEGORIAS.indexOf(c) + 1).build()))
                .toList();
        Category catComida = categorias.get(0);
        Category catTransporte = categorias.get(1);
        Category catOcio = categorias.get(2);
        Category catSuscripciones = categorias.get(3);
        Category catIngreso = categorias.get(7);

        Instant ahora = Instant.now();
        User usuario = userRepository.guardar(User.builder()
                .email("demo@lumen.app")
                .passwordHash(passwordEncoder.encode("demo1234"))
                .name("Marta")
                .locale("es").currency("EUR").theme("dark").avisosActivos(true)
                .createdAt(ahora).updatedAt(ahora)
                .build());

        Account visa = accountRepository.guardar(Account.builder()
                .userId(usuario.getId()).name("Visa ·· 4821").type("checking").bankName("BBVA").mask("·· 4821")
                .balance(182450).connected(true).lastSyncAt(ahora).createdAt(ahora).build());
        Account efectivo = accountRepository.guardar(Account.builder()
                .userId(usuario.getId()).name("Efectivo").type("cash").balance(6000).connected(false).createdAt(ahora).build());

        transactionRepository.guardar(tx(usuario.getId(), visa.getId(), catComida.getId(), -4280, "Mercadona", hace(ahora, 0), "cleared", false));
        transactionRepository.guardar(tx(usuario.getId(), visa.getId(), catIngreso.getId(), 185000, "Nómina", hace(ahora, 3), "cleared", false));
        transactionRepository.guardar(tx(usuario.getId(), visa.getId(), catSuscripciones.getId(), -1099, "Spotify", hace(ahora, 5), "cleared", true));
        transactionRepository.guardar(tx(usuario.getId(), visa.getId(), catTransporte.getId(), -6000, "Repsol", hace(ahora, 1), "pending", false));
        transactionRepository.guardar(tx(usuario.getId(), visa.getId(), catOcio.getId(), -12800, "Steam", hace(ahora, 2), "cleared", false));
        transactionRepository.guardar(tx(usuario.getId(), visa.getId(), null, -1550, "Comercio desconocido", hace(ahora, 4), "cleared", false));
        transactionRepository.guardar(tx(usuario.getId(), efectivo.getId(), catComida.getId(), -800, "Panadería", hace(ahora, 1), "cleared", false));

        budgetRepository.guardar(Budget.builder().userId(usuario.getId()).categoryId(catOcio.getId()).limitAmount(11000).period("monthly").alertThreshold(0.8).startDate(ahora).build());
        budgetRepository.guardar(Budget.builder().userId(usuario.getId()).categoryId(catComida.getId()).limitAmount(20000).period("monthly").alertThreshold(0.8).startDate(ahora).build());
        budgetRepository.guardar(Budget.builder().userId(usuario.getId()).categoryId(catTransporte.getId()).limitAmount(15000).period("monthly").alertThreshold(0.8).startDate(ahora).build());

        recurringRepository.guardar(Recurring.builder()
                .userId(usuario.getId()).name("Spotify").amount(-1099).categoryId(catSuscripciones.getId()).accountId(visa.getId())
                .frequency("monthly").startDate(hace(ahora, 30)).nextChargeDate(ahora.plus(30, ChronoUnit.DAYS)).active(true).build());

        savingsGoalRepository.guardar(SavingsGoal.builder()
                .userId(usuario.getId()).name("Viaje a Japón").targetAmount(200000).currentAmount(65000)
                .color("#42D0F4").icon("airplane-tilt").createdAt(ahora).build());

        log.info("Listo. Usuario demo: demo@lumen.app / demo1234 (id {})", usuario.getId());
    }

    private static Instant hace(Instant ahora, int dias) {
        return ahora.minus(dias, ChronoUnit.DAYS);
    }

    private static Transaction tx(UUID userId, UUID accountId, UUID categoryId, int amount, String name, Instant date, String status, boolean recurring) {
        return Transaction.builder()
                .userId(userId).accountId(accountId).categoryId(categoryId).amount(amount).currency("EUR")
                .name(name).date(date).status(status).recurring(recurring).createdAt(date)
                .build();
    }
}
