package com.mrworldthemetour.backend;

import com.mrworldthemetour.backend.auth.AuthDto;
import com.mrworldthemetour.backend.auth.AuthService;
import com.mrworldthemetour.backend.auth.JwtTokenService;
import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.sms.SignupProofVerifier;
import com.mrworldthemetour.backend.user.User;
import com.mrworldthemetour.backend.user.UserRepository;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenService jwtTokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SignupProofVerifier signupProofVerifier;

    @InjectMocks
    private AuthService authService;

    private static final String EMAIL = "test@example.com";
    private static final String PASSWORD = "Test1234!";
    private static final String PHONE = "01012345678";
    private static final String PROOF = "test-signup-proof";

    // 회원가입 성공: 정규화, 비밀번호 해싱, 기본 권한 확인
    @Test
    void signupSucceeds() {
        var request = signupRequest();

        // 실제 BCrypt로 비밀번호가 해싱되는지 확인
        var bcrypt = new BCryptPasswordEncoder();
        String passwordHash = bcrypt.encode(PASSWORD);

        when(passwordEncoder.encode(PASSWORD))
                .thenReturn(passwordHash);

        User savedUser = mock(User.class);
        when(savedUser.getId()).thenReturn(1L);

        when(userRepository.saveAndFlush(any(User.class)))
                .thenReturn(savedUser);

        AuthDto.SignupResponse response = authService.signup(request);

        ArgumentCaptor<User> captor =
                ArgumentCaptor.forClass(User.class);

        verify(userRepository).saveAndFlush(captor.capture());

        User user = captor.getValue();

        assertEquals(EMAIL, user.getEmail());
        assertEquals(PHONE, user.getPhoneNum());
        assertEquals("테스트회원", user.getName());
        assertEquals(User.Role.USER, user.getRole());
        assertEquals(User.Level.BRONZE, user.getLevel());

        assertNotEquals(PASSWORD, user.getPasswordHash());
        assertTrue(bcrypt.matches(PASSWORD, user.getPasswordHash()));

        assertEquals(Long.valueOf(1L), response.userId());

        verify(signupProofVerifier).verifyAndConsume(PROOF, PHONE);
        verifyNoInteractions(jwtTokenService);
    }

    // 이메일 중복
    @Test
    void signupRejectsDuplicateEmail() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.signup(signupRequest())
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("EMAIL_ALREADY_EXISTS", exception.getCode());

        verify(userRepository, never()).saveAndFlush(any(User.class));
        verifyNoInteractions(signupProofVerifier, passwordEncoder);
    }

    // 전화번호 중복
    @Test
    void signupRejectsDuplicatePhone() {
        when(userRepository.existsByPhoneNum(PHONE)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.signup(signupRequest())
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("PHONE_ALREADY_EXISTS", exception.getCode());

        verify(userRepository, never()).saveAndFlush(any(User.class));
        verifyNoInteractions(signupProofVerifier, passwordEncoder);
    }

    // SMS 가입 인증 증표가 유효하지 않음
    @Test
    void signupRejectsInvalidProof() {
        when(passwordEncoder.encode(PASSWORD))
                .thenReturn("test-password-hash");

        doThrow(new BusinessException(
                HttpStatus.BAD_REQUEST,
                "INVALID_SIGNUP_PROOF",
                "전화번호 인증 정보가 유효하지 않습니다."
        )).when(signupProofVerifier).verifyAndConsume(PROOF, PHONE);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.signup(signupRequest())
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("INVALID_SIGNUP_PROOF", exception.getCode());

        verify(userRepository, never()).saveAndFlush(any(User.class));
        verifyNoInteractions(jwtTokenService);
    }

    // 일반 로그인 성공
    @Test
    void loginSucceeds() {
        User user = mock(User.class);

        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(user));
        when(user.getPasswordHash()).thenReturn("stored-hash");
        when(passwordEncoder.matches(PASSWORD, "stored-hash"))
                .thenReturn(true);

        stubToken(user);

        AuthDto.LoginResponse response =
                authService.login(loginRequest(PASSWORD));

        assertTokenResponse(response);
        verify(jwtTokenService).createAccessToken(user);
    }

    // 존재하지 않는 회원
    @Test
    void loginRejectsUnknownEmail() {
        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.login(loginRequest(PASSWORD))
        );

        assertInvalidCredentials(exception);
        verifyNoInteractions(passwordEncoder, jwtTokenService);
    }

    // 일반 로그인 비밀번호 불일치
    @Test
    void loginRejectsWrongPassword() {
        User user = mock(User.class);

        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(user));
        when(user.getPasswordHash()).thenReturn("stored-hash");

        // boolean Mock의 기본 반환값은 false
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.login(loginRequest("wrong-password"))
        );

        assertInvalidCredentials(exception);

        verify(passwordEncoder).matches("wrong-password", "stored-hash");
        verifyNoInteractions(jwtTokenService);
    }

    // 관리자 로그인 성공
    @Test
    void adminLoginSucceeds() {
        User user = mock(User.class);

        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(user));
        when(user.getPasswordHash()).thenReturn("stored-hash");
        when(user.getRole()).thenReturn(User.Role.ADMIN);
        when(passwordEncoder.matches(PASSWORD, "stored-hash"))
                .thenReturn(true);

        stubToken(user);

        AuthDto.LoginResponse response =
                authService.adminLogin(loginRequest(PASSWORD));

        assertTokenResponse(response);
        verify(jwtTokenService).createAccessToken(user);
    }

    // 비밀번호가 맞아도 일반 회원은 관리자 로그인 불가
    @Test
    void adminLoginRejectsRegularUser() {
        User user = mock(User.class);

        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(user));
        when(user.getRole()).thenReturn(User.Role.USER);

        // 현재 코드와 검증 순서를 수정한 코드 모두에서
        // 사용할 수 있도록 비밀번호 조회·검증은 lenient 처리
        lenient().when(user.getPasswordHash()).thenReturn("stored-hash");
        lenient().when(passwordEncoder.matches(PASSWORD, "stored-hash"))
                .thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.adminLogin(loginRequest(PASSWORD))
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        assertEquals("ADMIN_ACCESS_DENIED", exception.getCode());

        verifyNoInteractions(jwtTokenService);
    }

    // 역할에 관계없이 비밀번호가 틀리면 먼저 401이어야 함
    @Test
    void adminLoginChecksPasswordBeforeRole() {
        User user = mock(User.class);

        when(userRepository.findByEmail(EMAIL))
                .thenReturn(Optional.of(user));

        lenient().when(user.getRole()).thenReturn(User.Role.USER);
        lenient().when(user.getPasswordHash()).thenReturn("stored-hash");

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> authService.adminLogin(loginRequest("wrong-password"))
        );

        assertInvalidCredentials(exception);
        verifyNoInteractions(jwtTokenService);
    }

    private AuthDto.SignupRequest signupRequest() {
        return new AuthDto.SignupRequest(
                "TEST@example.com",
                PASSWORD,
                "010-1234-5678",
                "테스트회원",
                "여행자",
                "서울시 테스트주소",
                PROOF
        );
    }

    private AuthDto.LoginRequest loginRequest(String password) {
        return new AuthDto.LoginRequest(EMAIL, password);
    }

    private void stubToken(User user) {
        when(jwtTokenService.createAccessToken(user))
                .thenReturn("test-access-token");
        when(jwtTokenService.getAccessTokenExpiresIn())
                .thenReturn(900L);
    }

    private void assertTokenResponse(AuthDto.LoginResponse response) {
        assertEquals("test-access-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(900L, response.expiresIn());
    }

    private void assertInvalidCredentials(BusinessException exception) {
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("INVALID_CREDENTIALS", exception.getCode());
    }
}