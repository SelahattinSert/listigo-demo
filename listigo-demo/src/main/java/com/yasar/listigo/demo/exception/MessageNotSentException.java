package com.yasar.listigo.demo.exception;

public class MessageNotSentException extends RuntimeException {
    public MessageNotSentException(String message) {
        super(message);
    }
}