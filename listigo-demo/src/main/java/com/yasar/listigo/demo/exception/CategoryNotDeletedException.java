package com.yasar.listigo.demo.exception;

public class CategoryNotDeletedException extends RuntimeException {
    public CategoryNotDeletedException(String message) {
        super(message);
    }
}