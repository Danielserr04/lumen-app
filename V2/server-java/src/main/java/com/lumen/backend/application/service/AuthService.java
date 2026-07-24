package com.lumen.backend.application.service;

import com.lumen.backend.application.port.out.AccountRepositoryPort;
import com.lumen.backend.application.port.out.UserRepositoryPort;
import com.lumen.backend.domain.exception.ApiException;
import com.lumen.backend.domain.model.Account;
import com.lumen.backend.domain.model.User;
import com.lumen.backend.infrastructure.web.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepositoryPort userRepository;
    private final AccountRepositoryPort accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public record Sesion(User usuario, String token) {}

    public Sesion signup(String email, String password, String name) {
        if (email == null || email.isBlank() || password == null || name == null || name.isBlank()) {
            throw ApiException.badRequest("Email, contraseña y nombre son obligatorios");
        }
        if (password.length() < 8) {
            throw ApiException.badRequest("La contraseña debe tener al menos 8 caracteres");
        }
        if (userRepository.buscarPorEmail(email).isPresent()) {
            throw ApiException.conflict("Ya existe una cuenta con ese email");
        }

        Instant ahora = Instant.now();
        User usuario = userRepository.guardar(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .locale("es")
                .currency("EUR")
                .theme("dark")
                .avisosActivos(true)
                .createdAt(ahora)
                .updatedAt(ahora)
                .build());

        // Cuenta en efectivo por defecto. Las categorías de sistema son globales (user_id
        // null) y se siembran una única vez — no se crean aquí para no duplicarlas.
        accountRepository.guardar(Account.builder()
                .userId(usuario.getId())
                .name("Efectivo")
                .type("cash")
                .balance(0)
                .connected(false)
                .createdAt(ahora)
                .build());

        return new Sesion(usuario, jwtService.firmar(usuario.getId()));
    }

    public Sesion login(String email, String password) {
        User usuario = userRepository.buscarPorEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Email o contraseña incorrectos"));
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw ApiException.unauthorized("Email o contraseña incorrectos");
        }
        return new Sesion(usuario, jwtService.firmar(usuario.getId()));
    }

    public void cambiarContrasena(java.util.UUID userId, String actual, String nueva) {
        if (nueva == null || nueva.length() < 8) {
            throw ApiException.badRequest("La nueva contraseña debe tener al menos 8 caracteres.");
        }
        User usuario = userRepository.buscarPorId(userId).orElseThrow(() -> ApiException.notFound("Usuario no encontrado"));
        if (!passwordEncoder.matches(actual, usuario.getPasswordHash())) {
            throw ApiException.badRequest("La contraseña actual no es correcta.");
        }
        usuario.setPasswordHash(passwordEncoder.encode(nueva));
        usuario.setUpdatedAt(Instant.now());
        userRepository.guardar(usuario);
    }
}
