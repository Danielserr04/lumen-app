package com.lumen.backend.infrastructure.web.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Firma/verifica el JWT de sesión a mano con jjwt — sin refresh token, mismo criterio
 * simple que el backend Node original (server-node-legacy, ver git tag backend-node-final).
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMillis;

    public JwtService(
            @Value("${lumen.jwt.secret}") String secret,
            @Value("${lumen.jwt.expiration-days}") long expirationDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMillis = Duration.ofDays(expirationDays).toMillis();
    }

    public String firmar(UUID userId) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plusMillis(expirationMillis)))
                .signWith(key)
                .compact();
    }

    /** Lanza una excepción no comprobada (JwtException) si el token no es válido/ha caducado. */
    public UUID verificarYObtenerUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return UUID.fromString(claims.getSubject());
    }
}
