package com.mrworldthemetour.backend.admin;

import com.mrworldthemetour.backend.inventory.InventoryService;
import com.mrworldthemetour.backend.inventory.ItemDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/items")
@RequiredArgsConstructor
public class AdminItemController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ItemDto.PageResponse> getItems(
            @RequestParam(name = "page", defaultValue = "0")
            int page,

            @RequestParam(name = "size", defaultValue = "20")
            int size
    ) {
        return ResponseEntity.ok(
                inventoryService.getItems(page, size)
        );
    } //전체 상품 목록 조회

    @PostMapping
    public ResponseEntity<ItemDto.ItemResponse> createItem(
            @Valid @RequestBody ItemDto.CreateRequest request
    ) {
        return ResponseEntity.status(201)
                .body(inventoryService.createItem(request));
    } //상품 등록

    @PostMapping("/{itemId}/inputs")
    public ResponseEntity<ItemDto.ItemResponse> receiveItem(
            @PathVariable("itemId") Long itemId,
            @Valid @RequestBody ItemDto.ReceiveRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.receiveItem(itemId, request)
        );
    } //기존 상품에 재고 추가
}