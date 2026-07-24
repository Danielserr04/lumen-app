package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.CategoryRepositoryPort;
import com.lumen.backend.domain.model.Category;
import com.lumen.backend.infrastructure.persistence.entity.CategoryEntity;
import com.lumen.backend.infrastructure.persistence.repository.CategoryJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CategoryRepositoryAdapter implements CategoryRepositoryPort {

    private final CategoryJpaRepository repository;

    @Override
    public List<Category> listarSistemaYDeUsuario(UUID userId) {
        return repository.findByUserIdIsNullOrUserIdOrderBySortOrderAsc(userId).stream().map(CategoryRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<Category> buscarPorId(UUID id) {
        return repository.findById(id).map(CategoryRepositoryAdapter::aDominio);
    }

    @Override
    public Category guardar(Category category) {
        return aDominio(repository.save(aEntidad(category)));
    }

    @Override
    public void eliminar(UUID id) {
        repository.deleteById(id);
    }

    static Category aDominio(CategoryEntity e) {
        return Category.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .name(e.getName())
                .icon(e.getIcon())
                .color(e.getColor())
                .tint(e.getTint())
                .kind(e.getKind())
                .system(e.isSystem())
                .sortOrder(e.getSortOrder())
                .build();
    }

    static CategoryEntity aEntidad(Category c) {
        return CategoryEntity.builder()
                .id(c.getId())
                .userId(c.getUserId())
                .name(c.getName())
                .icon(c.getIcon())
                .color(c.getColor())
                .tint(c.getTint())
                .kind(c.getKind())
                .isSystem(c.isSystem())
                .sortOrder(c.getSortOrder())
                .build();
    }
}
