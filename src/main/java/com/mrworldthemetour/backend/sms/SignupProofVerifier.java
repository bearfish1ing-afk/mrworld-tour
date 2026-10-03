package com.mrworldthemetour.backend.sms;

public interface SignupProofVerifier {

    // 유효한 가입 증표인지 확인하고 사용 처리
    void verifyAndConsume(String signupProof, String phoneNum);
}