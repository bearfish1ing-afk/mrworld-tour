package com.mrworldthemetour.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductOptionRepository
        extends JpaRepository<ProductOption, Long> {

    List<ProductOption> findByProduct_IdOrderByOptionTypeAscIdAsc(
            Long productId
    );

    Optional<ProductOption> findByIdAndProduct_Id(
            Long id,
            Long productId
    );
}