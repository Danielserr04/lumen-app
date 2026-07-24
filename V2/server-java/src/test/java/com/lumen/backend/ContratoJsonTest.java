package com.lumen.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lumen.backend.application.service.AnaliticaService;
import com.lumen.backend.domain.model.Account;
import com.lumen.backend.domain.model.Category;
import com.lumen.backend.domain.model.Transaction;
import com.lumen.backend.domain.model.User;
import com.lumen.backend.infrastructure.web.MovimientoController.MovimientoRequest;
import com.lumen.backend.infrastructure.web.RecurrenteController.RecurrenteRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Blinda el contrato JSON con el frontend (src/lib/httpApi.ts y src/types/entidades.ts).
 * Aquí se han colado ya varios fallos que no rompen la compilación pero dejan pantallas en
 * NaN, así que se comprueban los nombres de propiedad exactos, no solo que serialice.
 *
 * El mapper se construye igual que lo hace Spring Boot con nuestro application.yml
 * (SNAKE_CASE global + módulos de java.time y Optional), para que el test valga de algo.
 */
class ContratoJsonTest {

    private final ObjectMapper json = Jackson2ObjectMapperBuilder.json()
            .propertyNamingStrategy(com.fasterxml.jackson.databind.PropertyNamingStrategies.SNAKE_CASE)
            .build();

    @SuppressWarnings("unchecked")
    private Map<String, Object> aMapa(Object valor) throws Exception {
        return json.readValue(json.writeValueAsString(valor), Map.class);
    }

    // ===================== Entidades §8: snake_case =====================

    @Test
    void transaction_expone_los_campos_del_contrato() throws Exception {
        Map<String, Object> mapa = aMapa(Transaction.builder()
                .id(UUID.randomUUID()).userId(UUID.randomUUID()).accountId(UUID.randomUUID())
                .categoryId(UUID.randomUUID()).amount(-1250).currency("EUR").name("Mercadona")
                .date(Instant.now()).status("cleared").recurring(true).build());

        assertThat(mapa).containsKeys("id", "user_id", "account_id", "category_id", "amount", "is_recurring");
        // El getter isRecurring() haría que Jackson la llamase "recurring" sin el @JsonProperty.
        assertThat(mapa).doesNotContainKey("recurring");
    }

    @Test
    void account_y_category_conservan_sus_booleanos_is() throws Exception {
        assertThat(aMapa(Account.builder().name("Visa").type("card").connected(true).build()))
                .containsKey("is_connected").doesNotContainKey("connected");

        assertThat(aMapa(Category.builder().name("Comida").kind("expense").system(true).build()))
                .containsKey("is_system").doesNotContainKey("system");
    }

    @Test
    void user_nunca_filtra_el_hash_de_la_contrasena() throws Exception {
        Map<String, Object> mapa = aMapa(User.builder()
                .email("demo@lumen.app").passwordHash("$2a$10$loquesea").name("Marta").build());

        assertThat(mapa).containsKeys("email", "name", "avisos_activos");
        assertThat(mapa).doesNotContainKeys("password_hash", "passwordHash");
    }

    // ===================== DTOs derivados §15: camelCase =====================

    @Test
    void resumen_mensual_va_en_camel_case() throws Exception {
        Map<String, Object> mapa = aMapa(new AnaliticaService.ResumenMensual("2026-07", 200000, 85000, 120000, 35000, 0.7083, "ok"));

        // El Dashboard lee resumen.porcentajeGastado y resumen.presupuestoTotal (PantallaDashboard.tsx:144-147).
        assertThat(mapa).containsKeys("periodo", "ingresos", "gastos", "presupuestoTotal", "disponible", "porcentajeGastado", "estado");
        assertThat(mapa).doesNotContainKeys("presupuesto_total", "porcentaje_gastado");
    }

    @Test
    void punto_historico_va_en_camel_case() throws Exception {
        // PantallaAnalisis.tsx:65,108,119 lee punto.balanceDisponible.
        assertThat(aMapa(new AnaliticaService.PuntoHistorico("2026-07", "Jul", 200000, 85000, 35000)))
                .containsKey("balanceDisponible").doesNotContainKey("balance_disponible");
    }

    @Test
    void informe_de_movimiento_va_en_camel_case() throws Exception {
        var media = new AnaliticaService.MediaComercio(4500, 3, 1500);
        Map<String, Object> mapa = aMapa(new AnaliticaService.InformeMovimiento(
                Transaction.builder().name("Mercadona").amount(-1250).build(),
                "A", null, null, null, media, null, null, null));

        // PantallaInformeMovimiento.tsx:63 desestructura otraPata; :176 lee media.mediaPorMes.
        assertThat(mapa).containsKeys("transaccion", "variante", "media", "otraPata");
        assertThat(mapa).doesNotContainKey("otra_pata");
        assertThat(aMapa(media)).containsKeys("mediaPorMes", "visitasPorMes", "ticketMedio");
    }

    // ===================== PATCH parcial: ausente vs null =====================

    @Test
    void patch_de_movimiento_distingue_campo_ausente_de_campo_a_null() throws Exception {
        // Recategorizar desde el informe manda solo category_id (PantallaInformeMovimiento.tsx:55):
        // el resto no viene, así que no se puede tocar — incluido amount, que antes llegaba
        // como 0 y hacía saltar un 400 "El importe no puede ser 0 €".
        ObjectNode soloCategoria = (ObjectNode) json.readTree("{\"category_id\":\"3f2504e0-4f89-11d3-9a0c-0305e82c3301\"}");
        MovimientoRequest datos = json.treeToValue(soloCategoria, MovimientoRequest.class);

        assertThat(datos.category_id()).isNotNull();
        assertThat(datos.amount()).isNull();
        assertThat(campos(soloCategoria)).containsExactly("category_id");

        // Vaciar la nota desde el formulario manda note: null explícito = sí hay que borrarla.
        ObjectNode notaVacia = (ObjectNode) json.readTree("{\"note\":null}");
        assertThat(json.treeToValue(notaVacia, MovimientoRequest.class).note()).isNull();
        assertThat(campos(notaVacia)).contains("note");
    }

    /** Réplica de PatchBody.campos(), que es package-private en infrastructure.web. */
    private static java.util.Set<String> campos(ObjectNode cuerpo) {
        java.util.Set<String> nombres = new java.util.HashSet<>();
        cuerpo.fieldNames().forEachRemaining(nombres::add);
        return nombres;
    }

    @Test
    void patch_de_recurrente_acepta_active_e_installment_total() throws Exception {
        // PantallaFormularioRecurrente.tsx:87-88 los envía; antes se descartaban en silencio.
        RecurrenteRequest body = json.readValue("{\"active\":false,\"installment_total\":12}", RecurrenteRequest.class);

        assertThat(body.active()).isFalse();
        assertThat(body.installment_total()).isEqualTo(12);
    }
}
