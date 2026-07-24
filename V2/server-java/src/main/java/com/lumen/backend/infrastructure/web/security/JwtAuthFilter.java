package com.lumen.backend.infrastructure.web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

/**
 * Valida el JWT del header Authorization y, si es válido, deja el userId como "principal"
 * de la autenticación de Spring Security — los controllers lo recuperan con
 * @AuthenticationPrincipal UUID userId, sin volver a tocar el token.
 * Un token ausente/inválido simplemente no autentica la petición (deja que Spring Security,
 * vía SecurityConfig, decida si la ruta requiere auth y devuelva 401 si la necesita).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String cabecera = request.getHeader("Authorization");
        if (cabecera != null && cabecera.startsWith("Bearer ")) {
            try {
                UUID userId = jwtService.verificarYObtenerUserId(cabecera.substring(7));
                var authentication = new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ignorado) {
                // Token inválido/caducado: no se autentica; SecurityConfig decide si la ruta lo exige.
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
