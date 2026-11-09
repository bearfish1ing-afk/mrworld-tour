package com.mrworldthemetour.backend.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM Item i
            WHERE i.id = :itemId
            """)
    Optional<Item> findByIdForUpdate(@Param("itemId") Long itemId);

    //재고 변경 시 사용, @Transactional 내부에서만 사용해야 함 (비관적 락)

    //목록, 단건 조회와 저장은 상속받은 메서드로 처리 가능
}