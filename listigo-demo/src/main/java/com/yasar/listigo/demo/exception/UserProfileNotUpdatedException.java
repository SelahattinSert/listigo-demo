package com.yasar.listigo.demo.exception;

public class UserProfileNotUpdatedException extends RuntimeException {
    public UserProfileNotUpdatedException(String message) {
        super(message);
    }
}