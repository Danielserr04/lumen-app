package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.port.out.NotificationQueuePort;
import com.lumen.backend.application.port.out.NotificationRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificationRepositoryPort notificationRepository;
    private final NotificationQueuePort notificationQueue;

    @GetMapping
    public List<Notification> listar(@AuthenticationPrincipal UUID userId, @RequestParam(required = false) String read) {
        if ("false".equals(read)) return notificationRepository.listarNoLeidasPorUsuario(userId);
        return notificationRepository.listarPorUsuario(userId);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@AuthenticationPrincipal UUID userId) {
        return Map.of("count", notificationRepository.contarNoLeidas(userId));
    }

    @GetMapping("/{id}")
    public Notification obtener(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Notification n = notificationRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Notificación no encontrada"));
        comprobarPropiedad(n, userId);
        return n;
    }

    @PatchMapping("/{id}")
    public Notification marcarLeida(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Notification n = notificationRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Notificación no encontrada"));
        comprobarPropiedad(n, userId);
        n.setRead(true);
        return notificationRepository.guardar(n);
    }

    @PostMapping("/read-all")
    public Map<String, Boolean> marcarTodasLeidas(@AuthenticationPrincipal UUID userId) {
        notificationRepository.marcarTodasLeidas(userId);
        return Map.of("ok", true);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> eliminar(@AuthenticationPrincipal UUID userId, @PathVariable UUID id) {
        Notification n = notificationRepository.buscarPorId(id).orElseThrow(() -> ApiException.notFound("Notificación no encontrada"));
        comprobarPropiedad(n, userId);
        notificationRepository.eliminar(id);
        return Map.of("ok", true);
    }

    @PostMapping("/drain-new")
    public List<Notification> drenarNuevas(@AuthenticationPrincipal UUID userId) {
        return notificationQueue.drenar(userId);
    }

    private void comprobarPropiedad(Notification n, UUID userId) {
        if (!n.getUserId().equals(userId)) throw ApiException.notFound("Notificación no encontrada");
    }
}
