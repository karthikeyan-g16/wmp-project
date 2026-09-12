package com.wmp.portfolio.dto.response;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String fullName,
    String riskProfile,
    Instant createdAt,
    Instant updatedAt
) {}
