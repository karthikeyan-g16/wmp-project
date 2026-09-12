package com.wmp.portfolio.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PortfolioResponse(
    UUID id,
    UUID userId,
    String name,
    String description,
    String currency,
    String status,
    List<HoldingResponse> holdings,
    Instant createdAt,
    Instant updatedAt
) {}
