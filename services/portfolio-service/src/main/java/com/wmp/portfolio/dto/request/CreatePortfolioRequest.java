package com.wmp.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreatePortfolioRequest(
    @NotBlank String name,
    String description,
    String currency
) {}
