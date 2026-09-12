package com.wmp.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record AddHoldingRequest(
    @NotBlank String tickerSymbol,
    @NotBlank String assetType,
    @NotNull @Positive BigDecimal quantity,
    @NotNull @Positive BigDecimal averageCost
) {}
