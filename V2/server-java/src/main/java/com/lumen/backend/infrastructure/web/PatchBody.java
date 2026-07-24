package com.lumen.backend.infrastructure.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lumen.backend.domain.exception.ApiException;

import java.util.HashSet;
import java.util.Set;

/**
 * Ayuda para los PATCH parciales (§11): un PATCH tiene que distinguir "el campo no venía"
 * (no se toca) de "el campo venía a null" (se borra), y eso el tipado por sí solo no lo dice
 * —tampoco Optional, que llega vacío en ambos casos—. Así que el cuerpo se recibe como
 * ObjectNode: los valores se leen con el record de siempre y la presencia con `campos()`.
 */
final class PatchBody {

    private PatchBody() {}

    /** Nombres de las claves que traía el JSON, para saber qué se ha pedido cambiar de verdad. */
    static Set<String> campos(ObjectNode cuerpo) {
        Set<String> nombres = new HashSet<>();
        cuerpo.fieldNames().forEachRemaining(nombres::add);
        return nombres;
    }

    /** Convierte el cuerpo al record de la petición, traduciendo un JSON inválido a un 400. */
    static <T> T leer(ObjectMapper objectMapper, ObjectNode cuerpo, Class<T> tipo) {
        try {
            return objectMapper.treeToValue(cuerpo, tipo);
        } catch (Exception e) {
            throw ApiException.badRequest("Cuerpo de la petición no válido");
        }
    }
}
