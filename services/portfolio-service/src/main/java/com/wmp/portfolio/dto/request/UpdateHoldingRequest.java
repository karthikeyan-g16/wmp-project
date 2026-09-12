package com.wmp.portfolio.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record UpdateHoldingRequest(
    @NotNull @Positive BigDecimal quantity,
    @NotNull @Positive BigDecimal averageCost
) {}
