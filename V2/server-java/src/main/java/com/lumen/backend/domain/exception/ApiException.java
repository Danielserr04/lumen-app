package com.lumen.backend.domain.exception;

import lombok.Getter;

/** Error uniforme de dominio — equivalente a ErrorApi en el backend Node y en el frontend. */
@Getter
public class ApiException extends RuntimeException {
    private final int status;

    public ApiException(int status, String message) {
        super(message);
        this.status = status;
    }

    public static ApiException notFound(String message) {
        return new ApiException(404, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(400, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(409, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(403, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(401, message);
    }
}
