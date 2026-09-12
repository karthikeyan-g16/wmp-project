package com.wmp.portfolio.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HoldingResponse(
    UUID id,
    UUID portfolioId,
    String tickerSymbol,
    String assetType,
    BigDecimal quantity,
    BigDecimal averageCost,
    BigDecimal totalCost,
    LocalDate acquiredAt,
    Instant createdAt,
    Instant updatedAt
) {}
