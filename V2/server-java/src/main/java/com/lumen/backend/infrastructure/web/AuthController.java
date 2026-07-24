package com.lumen.backend.infrastructure.web;

import com.lumen.backend.application.service.AuthService;
import com.lumen.backend.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record SesionResponse(User user, String token) {}
    public record SignupRequest(String name, String email, String password) {}
    public record LoginRequest(String email, String password) {}
    public record CambiarContrasenaRequest(String actual, String nueva) {}

    @PostMapping("/auth/signup")
    public SesionResponse signup(@RequestBody SignupRequest body) {
        var sesion = authService.signup(body.email(), body.password(), body.name());
        return new SesionResponse(sesion.usuario(), sesion.token());
    }

    @PostMapping("/auth/login")
    public SesionResponse login(@RequestBody LoginRequest body) {
        var sesion = authService.login(body.email(), body.password());
        return new SesionResponse(sesion.usuario(), sesion.token());
    }

    @PostMapping("/auth/logout")
    public Map<String, Boolean> logout() {
        return Map.of("ok", true);
    }

    @PostMapping("/auth/forgot-password")
    public Map<String, Boolean> forgotPassword() {
        return Map.of("ok", true);
    }

    @PostMapping("/auth/reset-password")
    public Map<String, Boolean> resetPassword() {
        return Map.of("ok", true);
    }

    @PostMapping("/auth/change-password")
    public void changePassword(@AuthenticationPrincipal UUID userId, @RequestBody CambiarContrasenaRequest body) {
        authService.cambiarContrasena(userId, body.actual(), body.nueva());
    }
}
