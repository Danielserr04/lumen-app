package com.lumen.backend.infrastructure.persistence.adapter;

import com.lumen.backend.application.port.out.NotificationQueuePort;
import com.lumen.backend.domain.model.Notification;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Cola en memoria por usuario — vive mientras viva el proceso, válido para el único
 * servidor de Render de este MVP (mismo patrón que colaNotificacionesNuevas del backend
 * Node original).
 */
@Component
public class NotificationQueueAdapter implements NotificationQueuePort {

    private final Map<UUID, List<Notification>> cola = new ConcurrentHashMap<>();

    @Override
    public void encolar(Notification notification) {
        cola.computeIfAbsent(notification.getUserId(), id -> new CopyOnWriteArrayList<>()).add(notification);
    }

    @Override
    public List<Notification> drenar(UUID userId) {
        List<Notification> nuevas = cola.remove(userId);
        return nuevas != null ? nuevas : List.of();
    }
}
