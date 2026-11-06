package com.mrworldthemetour.backend.exception;

import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation
        .ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 1. 이메일 중복, SMS 인증 만료 등 업무 규칙 위반
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Object> handleBusinessException(
            BusinessException exception,
            WebRequest request
    ) {
        return respond(
                exception,
                exception.getStatus(),
                exception.getCode(),
                exception.getMessage(),
                request
        );
    }

    // 2. @Valid가 적용된 요청 DTO의 검증 실패
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request
    ) {
        ProblemDetail problem = createProblem(
                status,
                "VALIDATION_FAILED",
                "입력값을 확인해 주세요."
        );

        List<ValidationError> errors = exception.getBindingResult()
                .getAllErrors()
                .stream()
                .map(error -> new ValidationError(
                        error instanceof org.springframework.validation.FieldError fieldError
                                ? fieldError.getField()
                                : error.getObjectName(),
                        Objects.requireNonNullElse(
                                error.getDefaultMessage(),
                                "올바르지 않은 값입니다."
                        )
                ))
                .toList();

        problem.setProperty("errors", errors);

        return handleExceptionInternal(
                exception,
                problem,
                headers,
                status,
                request
        );
    }

    // 3. JSON 문법 오류, 잘못된 타입, 필수 요청 본문 누락
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request
    ) {
        ProblemDetail problem = createProblem(
                status,
                "INVALID_REQUEST_BODY",
                "요청 본문의 형식이 올바르지 않습니다."
        );

        return handleExceptionInternal(
                exception,
                problem,
                headers,
                status,
                request
        );
    }

    // 4. MVC 처리 중 발생한 인증 실패
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(
            AuthenticationException exception,
            WebRequest request
    ) {
        return respond(
                exception,
                HttpStatus.UNAUTHORIZED,
                "AUTHENTICATION_FAILED",
                "인증에 실패했습니다.",
                request
        );
    }

    // 5. MVC 처리 중 발생한 접근 권한 부족
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(
            AccessDeniedException exception,
            WebRequest request
    ) {
        return respond(
                exception,
                HttpStatus.FORBIDDEN,
                "ACCESS_DENIED",
                "접근 권한이 없습니다.",
                request
        );
    }

    // 6. 예상하지 못한 서버 오류
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpectedException(
            Exception exception,
            WebRequest request
    ) {
        log.error("예상하지 못한 서버 오류가 발생했습니다.", exception);

        return respond(
                exception,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                request
        );
    }

    private ResponseEntity<Object> respond(
            Exception exception,
            HttpStatus status,
            String code,
            String message,
            WebRequest request
    ) {
        return handleExceptionInternal(
                exception,
                createProblem(status, code, message),
                new HttpHeaders(),
                status,
                request
        );
    }

    private ProblemDetail createProblem(
            HttpStatusCode status,
            String code,
            String message
    ) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(status, message);

        problem.setProperty("code", code);

        return problem;
    }

    public record ValidationError(
            String field,
            String message
    ) {
    }
}

//SMS 인증 오류는 BusinessException 이용해 변환해서 출력, JWT 인증 실패는 SecurityConfig에서 처리