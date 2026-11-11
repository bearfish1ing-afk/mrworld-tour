package com.mrworldthemetour.backend.reservation;

import com.mrworldthemetour.backend.inventory.Item;
import com.mrworldthemetour.backend.inventory.ItemRepository;
import com.mrworldthemetour.backend.inventory.StockHistory;
import com.mrworldthemetour.backend.inventory.StockHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

// 상품 기념품 재고 배정/복구
@Service
@RequiredArgsConstructor
public class SouvenirService {
    private final ItemRepository itemRepository;
    private final StockHistoryRepository stockHistoryRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public void adjust(Reservation reservation, Item souvenirItem, int target) {
        Long itemId = reservation.getSouvenirItemId();
        if (itemId == null) {
            if (souvenirItem == null) {
                return;
            }
            itemId = souvenirItem.getId();
        }

        Item item = itemRepository.findByIdForUpdate(itemId).orElse(null);
        if (item == null) {
            return;
        }

        int current = reservation.souvenirQuantityOrZero();
        int diff = target - current;

        if (diff > 0) {
            int allocated = item.allocate(diff);
            if (allocated > 0) {
                stockHistoryRepository.save(StockHistory.allocate(
                        item, reservation.getId(), allocated, "예약 기념품 배정"));
            }
            reservation.assignSouvenir(item.getId(), current + allocated);
        } else if (diff < 0) {
            int restored = -diff;
            item.restore(restored);
            stockHistoryRepository.save(StockHistory.restore(
                    item, reservation.getId(), restored, "예약 변경/취소로 기념품 복구"));
            reservation.assignSouvenir(item.getId(), current - restored);
        }
    }
}
