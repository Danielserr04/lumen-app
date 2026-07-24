package com.lumen.backend.application.service;

import com.lumen.backend.application.port.out.NotificationQueuePort;
import com.lumen.backend.application.port.out.NotificationRepositoryPort;
import com.lumen.backend.application.port.out.UserRepositoryPort;
import com.lumen.backend.domain.model.Notification;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Genera notificaciones como efecto lateral de una acción (§13.5) — mismo criterio que
 * registrarNotificacion del backend Node original: respeta la preferencia "avisos activos"
 * del usuario y encola la notificación para que la pantalla la muestre como toast al momento.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepositoryPort notificationRepository;
    private final NotificationQueuePort notificationQueue;
    private final UserRepositoryPort userRepository;

    public void registrar(Datos datos) {
        boolean avisosActivos = userRepository.buscarPorId(datos.userId()).map(u -> u.isAvisosActivos()).orElse(false);
        if (!avisosActivos) return;

        Notification notificacion = Notification.builder()
                .userId(datos.userId())
                .type(datos.type())
                .title(datos.title())
                .body(datos.body())
                .relatedTransactionId(datos.relatedTransactionId())
                .read(false)
                .createdAt(Instant.now())
                .severity(datos.severity() != null ? datos.severity() : "info")
                .actionType(datos.actionType())
                .actionTargetId(datos.actionTargetId())
                .build();

        Notification guardada = notificationRepository.guardar(notificacion);
        notificationQueue.encolar(guardada);
    }

    @Builder
    public record Datos(
            UUID userId,
            String type,
            String severity,
            String title,
            String body,
            UUID relatedTransactionId,
            String actionType,
            String actionTargetId
    ) {}
}
