package com.mrworldthemetour.backend.reservation;

import java.util.List;

public record ReservationChangeRequest(
        Long productGradeId,
        Integer people,
        Long hotelOptionId,
        Long mealOptionId,
        Long vehicleOptionId,
        List<PriceRequest.DrinkRequest> drinks
) {
}
