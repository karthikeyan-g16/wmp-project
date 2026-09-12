package com.wmp.portfolio.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateUserRequest(
    UUID id,
    @NotBlank @Email String email,
    @NotBlank String fullName,
    String riskProfile
) {}
