package com.yasar.listigo.demo.exception;

public class JwtTokenGenerationException extends RuntimeException {
    public JwtTokenGenerationException(String message) {
        super(message);
    }
}