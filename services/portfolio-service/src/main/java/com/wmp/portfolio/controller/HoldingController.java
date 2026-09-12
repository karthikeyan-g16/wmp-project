package com.wmp.portfolio.controller;

import com.wmp.portfolio.dto.request.AddHoldingRequest;
import com.wmp.portfolio.dto.request.UpdateHoldingRequest;
import com.wmp.portfolio.dto.response.HoldingResponse;
import com.wmp.portfolio.service.HoldingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class HoldingController {

    private final HoldingService holdingService;

    public HoldingController(HoldingService holdingService) {
        this.holdingService = holdingService;
    }

    @PostMapping("/portfolios/{portfolioId}/holdings")
    public ResponseEntity<HoldingResponse> addHolding(
            @PathVariable UUID portfolioId,
            @Valid @RequestBody AddHoldingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(holdingService.addHolding(portfolioId, request));
    }

    @GetMapping("/portfolios/{portfolioId}/holdings")
    public ResponseEntity<List<HoldingResponse>> getHoldings(@PathVariable UUID portfolioId) {
        return ResponseEntity.ok(holdingService.getHoldings(portfolioId));
    }

    @PutMapping("/holdings/{holdingId}")
    public ResponseEntity<HoldingResponse> updateHolding(
            @PathVariable UUID holdingId,
            @Valid @RequestBody UpdateHoldingRequest request) {
        return ResponseEntity.ok(holdingService.updateHolding(holdingId, request));
    }

    @DeleteMapping("/holdings/{holdingId}")
    public ResponseEntity<Void> deleteHolding(@PathVariable UUID holdingId) {
        holdingService.deleteHolding(holdingId);
        return ResponseEntity.noContent().build();
    }
}
