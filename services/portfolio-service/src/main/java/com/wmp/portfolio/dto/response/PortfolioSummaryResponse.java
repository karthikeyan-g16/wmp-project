package com.wmp.portfolio.dto.response;

import java.time.Instant;
import java.util.UUID;

public record PortfolioSummaryResponse(
    UUID id,
    String name,
    String currency,
    String status,
    int holdingsCount,
    Instant createdAt
) {}
