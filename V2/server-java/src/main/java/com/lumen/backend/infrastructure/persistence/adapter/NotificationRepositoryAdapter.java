package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.NotificationRepositoryPort;
import com.lumen.backend.domain.model.Notification;
import com.lumen.backend.infrastructure.persistence.entity.NotificationEntity;
import com.lumen.backend.infrastructure.persistence.repository.NotificationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepositoryPort {

    private final NotificationJpaRepository repository;

    @Override
    public List<Notification> listarPorUsuario(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(NotificationRepositoryAdapter::aDominio).toList();
    }

    @Override
    public List<Notification> listarNoLeidasPorUsuario(UUID userId) {
        return repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).stream().map(NotificationRepositoryAdapter::aDominio).toList();
    }

    @Override
    public Optional<Notification> buscarPorId(UUID id) {
        return repository.findById(id).map(NotificationRepositoryAdapter::aDominio);
    }

    @Override
    public Notification guardar(Notification notification) {
        return aDominio(repository.save(aEntidad(notification)));
    }

    @Override
    public void marcarTodasLeidas(UUID userId) {
        List<NotificationEntity> pendientes = repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        pendientes.forEach(n -> n.setRead(true));
        repository.saveAll(pendientes);
    }

    @Override
    public void eliminar(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public long contarNoLeidas(UUID userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    static Notification aDominio(NotificationEntity e) {
        return Notification.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .type(e.getType())
                .title(e.getTitle())
                .body(e.getBody())
                .relatedTransactionId(e.getRelatedTransactionId())
                .read(e.isRead())
                .createdAt(e.getCreatedAt())
                .severity(e.getSeverity())
                .actionType(e.getActionType())
                .actionTargetId(e.getActionTargetId())
                .build();
    }

    static NotificationEntity aEntidad(Notification n) {
        return NotificationEntity.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .relatedTransactionId(n.getRelatedTransactionId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .severity(n.getSeverity())
                .actionType(n.getActionType())
                .actionTargetId(n.getActionTargetId())
                .build();
    }
}
