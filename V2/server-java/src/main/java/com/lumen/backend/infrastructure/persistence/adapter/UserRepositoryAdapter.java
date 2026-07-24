package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.UserRepositoryPort;
import com.lumen.backend.domain.model.User;
import com.lumen.backend.infrastructure.persistence.entity.UserEntity;
import com.lumen.backend.infrastructure.persistence.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository repository;

    @Override
    public Optional<User> buscarPorEmail(String email) {
        return repository.findByEmail(email).map(UserRepositoryAdapter::aDominio);
    }

    @Override
    public Optional<User> buscarPorId(UUID id) {
        return repository.findById(id).map(UserRepositoryAdapter::aDominio);
    }

    @Override
    public User guardar(User user) {
        UserEntity entity = aEntidad(user);
        return aDominio(repository.save(entity));
    }

    static User aDominio(UserEntity e) {
        return User.builder()
                .id(e.getId())
                .email(e.getEmail())
                .passwordHash(e.getPasswordHash())
                .name(e.getName())
                .avatarUrl(e.getAvatarUrl())
                .locale(e.getLocale())
                .currency(e.getCurrency())
                .theme(e.getTheme())
                .avisosActivos(e.isAvisosActivos())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    static UserEntity aEntidad(User u) {
        return UserEntity.builder()
                .id(u.getId())
                .email(u.getEmail())
                .passwordHash(u.getPasswordHash())
                .name(u.getName())
                .avatarUrl(u.getAvatarUrl())
                .locale(u.getLocale())
                .currency(u.getCurrency())
                .theme(u.getTheme())
                .avisosActivos(u.isAvisosActivos())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
