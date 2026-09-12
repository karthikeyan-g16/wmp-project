package com.wmp.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wmp.portfolio.dto.request.CreatePortfolioRequest;
import com.wmp.portfolio.dto.response.PortfolioResponse;
import com.wmp.portfolio.dto.response.PortfolioSummaryResponse;
import com.wmp.portfolio.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortfolioController.class)
@AutoConfigureMockMvc(addFilters = false)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PortfolioService portfolioService;

    private final UUID userId = UUID.randomUUID();
    private final UUID portfolioId = UUID.randomUUID();

    @Test
    void createPortfolio_shouldReturn201() throws Exception {
        var request = new CreatePortfolioRequest("Growth", "Long-term", "USD");
        var response = new PortfolioResponse(portfolioId, userId, "Growth", "Long-term", "USD", "ACTIVE", List.of(), Instant.now(), Instant.now());
        when(portfolioService.createPortfolio(eq(userId), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/users/{userId}/portfolios", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Growth"));
    }

    @Test
    void getUserPortfolios_shouldReturn200() throws Exception {
        var summary = new PortfolioSummaryResponse(portfolioId, "Growth", "USD", "ACTIVE", 5, Instant.now());
        when(portfolioService.getUserPortfolios(userId)).thenReturn(List.of(summary));

        mockMvc.perform(get("/api/v1/users/{userId}/portfolios", userId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Growth"));
    }

    @Test
    void getPortfolio_shouldReturn200() throws Exception {
        var response = new PortfolioResponse(portfolioId, userId, "Growth", null, "USD", "ACTIVE", List.of(), Instant.now(), Instant.now());
        when(portfolioService.getPortfolioById(portfolioId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/portfolios/{portfolioId}", portfolioId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(portfolioId.toString()));
    }

    @Test
    void deletePortfolio_shouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/v1/portfolios/{portfolioId}", portfolioId))
            .andExpect(status().isNoContent());
    }
}
