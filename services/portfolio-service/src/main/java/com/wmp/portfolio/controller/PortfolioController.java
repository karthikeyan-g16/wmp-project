package com.wmp.portfolio.controller;

import com.wmp.portfolio.dto.request.CreatePortfolioRequest;
import com.wmp.portfolio.dto.response.PortfolioResponse;
import com.wmp.portfolio.dto.response.PortfolioSummaryResponse;
import com.wmp.portfolio.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @PostMapping("/users/{userId}/portfolios")
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @PathVariable UUID userId,
            @Valid @RequestBody CreatePortfolioRequest request) {
        validateUserAccess(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(portfolioService.createPortfolio(userId, request));
    }

    @GetMapping("/users/{userId}/portfolios")
    public ResponseEntity<List<PortfolioSummaryResponse>> getUserPortfolios(@PathVariable UUID userId) {
        validateUserAccess(userId);
        return ResponseEntity.ok(portfolioService.getUserPortfolios(userId));
    }

    @GetMapping("/portfolios/{portfolioId}")
    public ResponseEntity<PortfolioResponse> getPortfolio(@PathVariable UUID portfolioId) {
        return ResponseEntity.ok(portfolioService.getPortfolioById(portfolioId));
    }

    @PutMapping("/portfolios/{portfolioId}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @PathVariable UUID portfolioId,
            @Valid @RequestBody CreatePortfolioRequest request) {
        return ResponseEntity.ok(portfolioService.updatePortfolio(portfolioId, request));
    }

    @DeleteMapping("/portfolios/{portfolioId}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable UUID portfolioId) {
        portfolioService.deletePortfolio(portfolioId);
        return ResponseEntity.noContent().build();
    }

    private UUID getAuthenticatedUserId() {
        return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private void validateUserAccess(UUID userId) {
        var authenticatedUserId = getAuthenticatedUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
    }
}
