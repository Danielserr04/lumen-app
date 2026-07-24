package com.lumen.backend.application.port.out;

import com.lumen.backend.domain.model.Notification;

import java.util.List;
import java.util.UUID;

/** Cola en memoria de notificaciones recién creadas, pendientes de mostrarse como toast (§13.5). */
public interface NotificationQueuePort {
    void encolar(Notification notification);
    List<Notification> drenar(UUID userId);
}
