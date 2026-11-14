package com.mrworldthemetour.backend.inventory;

import com.mrworldthemetour.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final ItemRepository itemRepository;
    private final StockHistoryRepository stockHistoryRepository;

    // 입출고 이력 (itemId가 없으면 전체, 최신순)
    public ItemDto.HistoryPageResponse getHistory(Long itemId, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PAGE",
                    "페이지는 0 이상, 페이지 크기는 1~100이어야 합니다."
            );
        }
        PageRequest pageable = PageRequest.of(page, size);
        Page<StockHistory> result = itemId == null
                ? stockHistoryRepository.findAllByOrderByCreatedAtDescIdDesc(pageable)
                : stockHistoryRepository.findByItem_IdOrderByCreatedAtDescIdDesc(itemId, pageable);

        return new ItemDto.HistoryPageResponse(
                result.getContent().stream().map(ItemDto.HistoryResponse::from).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    public ItemDto.PageResponse getItems(int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_PAGE",
                    "페이지는 0 이상, 페이지 크기는 1~100이어야 합니다."
            );
        }

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "id")
        );

        Page<Item> result = itemRepository.findAll(pageable);

        return new ItemDto.PageResponse(
                result.getContent()
                        .stream()
                        .map(ItemDto.ItemResponse::from)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    } //전체 상품 목록 조회

    @Transactional
    public ItemDto.ItemResponse createItem(ItemDto.CreateRequest request) {
        Item item = new Item(
                request.itemName(),
                request.baseAmount()
        );

        if (request.initialAmount() > 0) {
            item.receive(request.initialAmount());
        }

        // ID와 updatedAt을 확정한 뒤 응답을 구성한다.
        itemRepository.saveAndFlush(item);

        if (request.initialAmount() > 0) {
            StockHistory history = StockHistory.receive(
                    item,
                    request.initialAmount(),
                    normalizeReason(request.reason(), "신규 물품 초기 입고")
            );

            stockHistoryRepository.save(history);
        }

        return ItemDto.ItemResponse.from(item);
    } //신규 물품 등록, 초기 재고 입력

    @Transactional
    public ItemDto.ItemResponse receiveItem(
            Long itemId,
            ItemDto.ReceiveRequest request
    ) {
        if (itemId == null || itemId <= 0) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_ITEM_ID",
                    "물품 ID는 양수여야 합니다."
            );
        }

        Item item = itemRepository.findByIdForUpdate(itemId)
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND,
                        "ITEM_NOT_FOUND",
                        "물품을 찾을 수 없습니다."
                ));

        if (request.quantity() > Integer.MAX_VALUE - item.getCurrentAmount()) {
            throw new BusinessException(
                    HttpStatus.BAD_REQUEST,
                    "STOCK_LIMIT_EXCEEDED",
                    "저장 가능한 재고 수량을 초과합니다."
            );
        }

        item.receive(request.quantity());

        StockHistory history = StockHistory.receive(
                item,
                request.quantity(),
                normalizeReason(request.reason(), "물품 입고")
        );

        stockHistoryRepository.save(history);

        // 재고와 이력을 반영(Transaction),  updatedAt 갱신
        itemRepository.flush();

        return ItemDto.ItemResponse.from(item);
    } //기존 상품에 재고 추가

    private String normalizeReason(String reason, String defaultReason) {
        return reason == null || reason.isBlank()
                ? defaultReason
                : reason.strip();
    }
}