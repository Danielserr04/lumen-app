package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.port.out.CategoryRepositoryPort;
import com.lumen.backend.application.port.out.TransactionRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoryRepositoryPort categoryRepository;
    private final TransactionRepositoryPort transactionRepository;

    public record CategoriaRequest(String name, String icon, String color, String tint, String kind) {}

    @GetMapping
    public List<Category> listar(@AuthenticationPrincipal UUID userId) {
        return categoryRepository.listarSistemaYDeUsuario(userId);
    }

    @PostMapping
    public Category crear(@AuthenticationPrincipal UUID userId, @RequestBody CategoriaRequest body) {
        if (body.name() == null || body.icon() == null || body.color() == null || body.kind() == null) {
            throw ApiException.badRequest("Nombre, icono, color y tipo son obligatorios");
        }
        return categoryRepository.guardar(Category.builder()
                .userId(userId)
                .name(body.name())
                .icon(body.icon())
                .color(body.color())
                .tint(body.tint() != null ? body.tint() : "152,162,184")
                .kind(body.kind())
                .system(false)
                .sortOrder(99)
                .build());
    }

    @PatchMapping("/{id}")
    public Category editar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id, @RequestBody CategoriaRequest body) {
        Category categoria = categoryRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Categoría no encontrada"));
        if (categoria.getUserId() == null || !categoria.getUserId().equals(userId)) throw ApiException.notFound("Categoría no encontrada");
        if (categoria.isSystem()) throw ApiException.forbidden("Las categorías de sistema no se pueden editar");
        if (body.name() != null) categoria.setName(body.name());
        if (body.icon() != null) categoria.setIcon(body.icon());
        if (body.color() != null) categoria.setColor(body.color());
        if (body.tint() != null) categoria.setTint(body.tint());
        if (body.kind() != null) categoria.setKind(body.kind());
        return categoryRepository.guardar(categoria);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Category categoria = categoryRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Categoría no encontrada"));
        if (categoria.getUserId() == null || !categoria.getUserId().equals(userId)) throw ApiException.notFound("Categoría no encontrada");
        if (categoria.isSystem()) throw ApiException.forbidden("Las categorías de sistema no se pueden editar");
        if (transactionRepository.contarPorCategoria(id) > 0) {
            throw ApiException.conflict("La categoría tiene movimientos asociados; reasigna a Otros primero");
        }
        categoryRepository.eliminar(id);
        return Map.of("ok", true);
    }
}
