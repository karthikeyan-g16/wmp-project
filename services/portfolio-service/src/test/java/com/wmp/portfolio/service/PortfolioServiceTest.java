package com.wmp.portfolio.service;

import com.wmp.portfolio.dto.request.CreatePortfolioRequest;
import com.wmp.portfolio.entity.Portfolio;
import com.wmp.portfolio.entity.User;
import com.wmp.portfolio.exception.DuplicateResourceException;
import com.wmp.portfolio.exception.ResourceNotFoundException;
import com.wmp.portfolio.repository.PortfolioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PortfolioService portfolioService;

    private User testUser;
    private Portfolio testPortfolio;
    private final UUID userId = UUID.randomUUID();
    private final UUID portfolioId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@wmp.com");
        testUser.setFullName("Test User");

        testPortfolio = new Portfolio();
        testPortfolio.setId(portfolioId);
        testPortfolio.setUser(testUser);
        testPortfolio.setName("Growth Portfolio");
        testPortfolio.setCurrency("USD");
        testPortfolio.setStatus(Portfolio.Status.ACTIVE);
        testPortfolio.setHoldings(new ArrayList<>());
    }

    @Test
    void createPortfolio_shouldCreateSuccessfully() {
        var request = new CreatePortfolioRequest("Growth Portfolio", "Long-term", "USD");
        when(userService.findUserOrThrow(userId)).thenReturn(testUser);
        when(portfolioRepository.existsByUserIdAndName(userId, "Growth Portfolio")).thenReturn(false);
        when(portfolioRepository.save(any(Portfolio.class))).thenReturn(testPortfolio);

        var response = portfolioService.createPortfolio(userId, request);

        assertThat(response.name()).isEqualTo("Growth Portfolio");
        assertThat(response.currency()).isEqualTo("USD");
    }

    @Test
    void createPortfolio_shouldThrowOnDuplicate() {
        var request = new CreatePortfolioRequest("Growth Portfolio", null, null);
        when(userService.findUserOrThrow(userId)).thenReturn(testUser);
        when(portfolioRepository.existsByUserIdAndName(userId, "Growth Portfolio")).thenReturn(true);

        assertThatThrownBy(() -> portfolioService.createPortfolio(userId, request))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void getUserPortfolios_shouldReturnList() {
        when(userService.findUserOrThrow(userId)).thenReturn(testUser);
        when(portfolioRepository.findByUserId(userId)).thenReturn(List.of(testPortfolio));

        var result = portfolioService.getUserPortfolios(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Growth Portfolio");
    }

    @Test
    void getPortfolioById_shouldThrowWhenNotFound() {
        when(portfolioRepository.findById(portfolioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> portfolioService.getPortfolioById(portfolioId))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deletePortfolio_shouldDelete() {
        when(portfolioRepository.findById(portfolioId)).thenReturn(Optional.of(testPortfolio));

        portfolioService.deletePortfolio(portfolioId);

        verify(portfolioRepository).delete(testPortfolio);
    }
}
