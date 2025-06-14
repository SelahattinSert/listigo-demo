package com.yasar.listigo.demo.security;

import com.yasar.listigo.demo.exception.AuthenticationFailedException;
import com.yasar.listigo.demo.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-resources")
                || path.startsWith("/webjars")) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            log.info("Authorization header missing or does not start with Bearer");
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.replace("Bearer ", "");
        try {
            if (jwtUtil.validateToken(token)) {
                UUID userId = jwtUtil.extractUserId(token);
                List<String> roles = jwtUtil.extractUserRoles(token);
                List<SimpleGrantedAuthority> authorities = roles != null ?
                        roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()) :
                        List.of();
                log.info("Token valid. UserId: {}, Authorities: {}", userId, authorities);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                log.warn("Token invalid");
            }
        } catch (Exception e) {
            log.error("Authentication failed: ", e);
            throw new AuthenticationFailedException("Authentication failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}