package com.mrworldthemetour.backend.sms;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/sms")
@RequiredArgsConstructor
public class SmsController {

    private final SmsService smsService;

    @PostMapping("/request")
    public ResponseEntity<SmsDto.SendResponse> requestCode(
            @Valid @RequestBody SmsDto.SendRequest request
    ) {
        return ResponseEntity.ok(smsService.requestCode(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<SmsDto.VerifyResponse> verifyCode(
            @Valid @RequestBody SmsDto.VerifyRequest request
    ) {
        return ResponseEntity.ok(smsService.verifyCode(request));
    }
}