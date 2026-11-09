package com.mrworldthemetour.backend.reservation;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerLevelService {
    private final ReservationRepository reservationRepository;

    public CustomerLevel levelCalculate(Long userId){
        if(userId==null){
            return CustomerLevel.BRONZE;
        }
        Long yearly = reservationRepository.sumAmount(
                userId, ReservationStatus.CONFIRMED, LocalDateTime.now().minusYears(1)
        );

        return CustomerLevel.from(yearly==null? 0:yearly);
    }
}
