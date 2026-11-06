package com.mrworldthemetour.backend.reservation;

import java.util.List;

public record ReservationCreateRequest(
        Long productId,
        Long productGradeId,
        Integer people,
        Long hotelOptionId,
        Long mealOptionId,
        Long vehicleOptionId,
        List<PriceRequest.DrinkRequest> drinks,
        String paymentMethod
) {
    public PriceRequest toPriceRequest(){
        return new PriceRequest(productId,productGradeId,people,hotelOptionId,mealOptionId,vehicleOptionId,drinks);
    }
}
