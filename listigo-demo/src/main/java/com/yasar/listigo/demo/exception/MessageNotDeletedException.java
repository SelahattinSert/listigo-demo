package com.yasar.listigo.demo.exception;

public class MessageNotDeletedException extends RuntimeException {
    public MessageNotDeletedException(String message) {
        super(message);
    }
}