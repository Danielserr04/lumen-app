package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepositoryPort {
    List<Notification> listarPorUsuario(UUID userId);
    List<Notification> listarNoLeidasPorUsuario(UUID userId);
    Optional<Notification> buscarPorId(UUID id);
    Notification guardar(Notification notification);
    void marcarTodasLeidas(UUID userId);
    void eliminar(UUID id);
    long contarNoLeidas(UUID userId);
}
