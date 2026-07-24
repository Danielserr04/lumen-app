package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.port.out.UserRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UsuarioController {

    private final UserRepositoryPort userRepository;

    public record CambiosMeRequest(String name, String avatar_url, String locale, String currency, String theme, Boolean avisos_activos) {}

    @GetMapping("/me")
    public User me(@AuthenticationPrincipal UUID userId) {
        return userRepository.buscarPorId(userId).orElseThrow(() -> ApiException.notFound("Usuario no encontrado"));
    }

    @PatchMapping("/me")
    public User actualizarMe(@AuthenticationPrincipal UUID userId, @RequestBody CambiosMeRequest body) {
        User usuario = userRepository.buscarPorId(userId).orElseThrow(() -> ApiException.notFound("Usuario no encontrado"));
        if (body.name() != null) usuario.setName(body.name());
        if (body.avatar_url() != null) usuario.setAvatarUrl(body.avatar_url());
        if (body.locale() != null) usuario.setLocale(body.locale());
        if (body.currency() != null) usuario.setCurrency(body.currency());
        if (body.theme() != null) usuario.setTheme(body.theme());
        if (body.avisos_activos() != null) usuario.setAvisosActivos(body.avisos_activos());
        usuario.setUpdatedAt(Instant.now());
        return userRepository.guardar(usuario);
    }
}
