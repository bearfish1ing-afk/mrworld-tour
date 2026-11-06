package com.mrworldthemetour.backend.auth;

import com.mrworldthemetour.backend.user.User;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.convert.DurationStyle;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final String audience;
    private final Duration accessTokenTtl;

    public JwtTokenService(
            SecretKey jwtSecretKey,
            @Value("${app.jwt.issuer}") String issuer,
            @Value("${app.jwt.audience}") String audience,
            @Value("${app.jwt.access-token-ttl}") String accessTokenTtl
    ) {
        this.jwtEncoder = new NimbusJwtEncoder(
                new ImmutableSecret<>(jwtSecretKey)
        );

        this.issuer = issuer;
        this.audience = audience;
        this.accessTokenTtl = DurationStyle.detectAndParse(accessTokenTtl);

        if (this.accessTokenTtl.getSeconds() <= 0) {
            throw new IllegalArgumentException(
                    "Access Token 유효기간은 최소 1초 이상이어야 합니다."
            );
        }
    }

    public String createAccessToken(User user) {
        if (user.getId() == null || user.getRole() == null) {
            throw new IllegalArgumentException(
                    "토큰 발급에는 회원 ID와 권한이 필요합니다."
            );
        }

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(accessTokenTtl);

        // JWT 헤더 서명 알고리즘
        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        // JWT에 담을 정보
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .audience(List.of(audience))
                .subject(user.getId().toString())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("role", user.getRole().name())
                .build();

        // 헤더와 정보를 서명하여 JWT 문자열 생성
        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }

    public long getAccessTokenExpiresIn() {
        return accessTokenTtl.getSeconds();
    }
}