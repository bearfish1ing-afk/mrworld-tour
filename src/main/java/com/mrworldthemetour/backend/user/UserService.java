package com.mrworldthemetour.backend.user;

import com.mrworldthemetour.backend.exception.BusinessException;
import com.mrworldthemetour.backend.reservation.CustomerLevel;
import com.mrworldthemetour.backend.reservation.CustomerLevelService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final CustomerLevelService customerLevelService;

    public UserService(UserRepository userRepository, CustomerLevelService customerLevelService) {
        this.userRepository = userRepository;
        this.customerLevelService = customerLevelService;
    }

    public UserResponse getMyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "회원정보를 찾을 수 없습니다."
                ));
        CustomerLevel level=customerLevelService.levelCalculate(userId);
        return UserResponse.from(user,User.Level.valueOf(level.name()));
    } //회원 정보 조회

}
