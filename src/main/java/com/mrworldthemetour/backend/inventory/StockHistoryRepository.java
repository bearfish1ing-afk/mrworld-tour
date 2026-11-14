package com.mrworldthemetour.backend.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockHistoryRepository
        extends JpaRepository<StockHistory, Long> {

    Page<StockHistory> findByItem_IdOrderByCreatedAtDescIdDesc(
            Long itemId, //엔티티 필드 경로
            Pageable pageable
    ); //물품별 이력 조회

    Page<StockHistory> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable); //전체 이력 조회
}