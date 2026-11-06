package com.mrworldthemetour.backend.reservation;

import java.util.List;

public record PriceRequest(
        Long productId,
        Long productGradeId,
        Integer people,
        Long hotelOptionId,
        Long mealOptionId,
        Long vehicleOptionId,
        List<DrinkRequest> drinks
) {
    public record DrinkRequest(Long optionId, Integer quantity){}
}
