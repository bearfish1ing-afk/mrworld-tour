package com.mrworldthemetour.backend.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "theme")
    @Query("""
            SELECT p
            FROM Product p
            WHERE p.status = :status
              AND p.deadline > :now
              AND (:themeId IS NULL OR p.theme.id = :themeId)
              AND (:departureFrom IS NULL
                   OR p.departureDate >= :departureFrom)
              AND (:departureTo IS NULL
                   OR p.departureDate <= :departureTo)
              AND (:minPrice IS NULL OR p.basePrice >= :minPrice)
              AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)
              AND (
                    :keyword IS NULL
                    OR LOWER(p.title) LIKE
                       LOWER(CONCAT('%', :keyword, '%')) ESCAPE '!'
                    OR LOWER(p.country) LIKE
                       LOWER(CONCAT('%', :keyword, '%')) ESCAPE '!'
                    OR LOWER(p.description) LIKE
                       LOWER(CONCAT('%', :keyword, '%')) ESCAPE '!'
                  )
            """)
    Page<Product> search(
            @Param("status") String status,
            @Param("now") LocalDateTime now,
            @Param("themeId") Long themeId,
            @Param("departureFrom") LocalDate departureFrom,
            @Param("departureTo") LocalDate departureTo,
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Override
    @EntityGraph(attributePaths = "theme")
    Optional<Product> findById(Long id);
}

/*
ProductService에서 문자열 변환 필요 :

keyword = keyword.strip()
        .replace("!", "!!")
        .replace("%", "!%")
        .replace("_", "!_");

 */