package com.mrworldthemetour.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductGradeRepository
        extends JpaRepository<ProductGrade, Long> {

    List<ProductGrade> findByProduct_IdOrderByExtraPriceAscIdAsc(
            Long productId
    );

    Optional<ProductGrade> findByIdAndProduct_Id(
            Long id,
            Long productId
    );
}