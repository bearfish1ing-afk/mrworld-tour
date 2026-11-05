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
import java.util.Collection;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "theme")
    @Query("""
            SELECT p
            FROM Product p
            WHERE p.status IN :statuses
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
            """) //검색에 와일드카드 활용
    Page<Product> search(
            @Param("statuses") Collection<Product.ProductStatus> statuses,
            @Param("now") LocalDateTime now,
            @Param("themeId") Long themeId,
            @Param("departureFrom") LocalDate departureFrom,
            @Param("departureTo") LocalDate departureTo,
            @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "theme")
    Optional<Product> findByIdAndStatusIn(Long id, Collection<Product.ProductStatus> statuses);

    @Override
    @EntityGraph(attributePaths = "theme")
    Optional<Product> findById(Long id);
}