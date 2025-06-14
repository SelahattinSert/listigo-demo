package com.yasar.listigo.demo.util;

import com.yasar.listigo.demo.exception.JwtTokenExpiredException;
import com.yasar.listigo.demo.exception.JwtTokenGenerationException;
import com.yasar.listigo.demo.exception.JwtTokenInvalidException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    @Getter
    @Value("${jwt.refreshExpiration}")
    private long refreshExpiration;

    public String generateToken(UUID userId, List<SimpleGrantedAuthority> authorities) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", authorities.stream().map(SimpleGrantedAuthority::getAuthority).collect(Collectors.toList()));
        try {
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(userId.toString())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + expiration))
                    .signWith(SignatureAlgorithm.HS512, secret)
                    .compact();
        } catch (Exception e) {
            throw new JwtTokenGenerationException("Failed to generate token: " + e.getMessage());
        }
    }

    public String generateToken(UUID userId) {
        return generateToken(userId, expiration);
    }

    public String generateToken(UUID userId, long expirationTime) {
        try {
            return Jwts.builder()
                    .setSubject(userId.toString())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                    .signWith(SignatureAlgorithm.HS512, secret)
                    .compact();
        } catch (Exception e) {
            throw new JwtTokenGenerationException("Failed to generate token: " + e.getMessage());
        }
    }

    public List<String> extractUserRoles(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token)
                    .getBody();
            return (List<String>) claims.get("roles", List.class);
        } catch (Exception e) {
            throw new JwtTokenInvalidException("Invalid token: " + e.getMessage());
        }
    }

    public UUID extractUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token)
                    .getBody();
            return UUID.fromString(claims.getSubject());
        } catch (Exception e) {
            throw new JwtTokenInvalidException("Invalid token: " + e.getMessage());
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new JwtTokenExpiredException("Token has expired: " + e.getMessage());
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            throw new JwtTokenInvalidException("Invalid token: " + e.getMessage());
        }
    }
}