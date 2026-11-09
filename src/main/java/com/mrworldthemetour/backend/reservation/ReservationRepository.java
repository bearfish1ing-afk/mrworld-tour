package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.product.Product;
import org.hibernate.sql.results.spi.ListResultsConsumer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {
    //예약번호 중복확인
    boolean existsByReservationCode(String reservationCode);

    Optional<Reservation> findByIdAndUserId(Long id, Long userId);

    //예약 목록
    List<Reservation> findByUserIdOrderByReservedAtDesc(Long userId);

    @Query("select coalesce(sum(r.finalAmount), 0) from Reservation r " +
            "where r.userId = :userId and r.status = :status and r.reservedAt >= :from")
    Long sumAmount(@Param("userId") Long userId,
                   @Param("status") ReservationStatus status,
                   @Param("from") LocalDateTime from);

    @Query("select p from Product p where p.status = :status and p.deadline < :now")
    List<Product> findExpiredProducts(@Param("status") Product.ProductStatus status,
                                      @Param("now") LocalDateTime now);
}
