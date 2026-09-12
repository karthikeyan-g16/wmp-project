package com.wmp.portfolio.service;

import com.wmp.portfolio.dto.request.AddHoldingRequest;
import com.wmp.portfolio.dto.request.UpdateHoldingRequest;
import com.wmp.portfolio.entity.Holding;
import com.wmp.portfolio.entity.Portfolio;
import com.wmp.portfolio.entity.User;
import com.wmp.portfolio.exception.DuplicateResourceException;
import com.wmp.portfolio.exception.ResourceNotFoundException;
import com.wmp.portfolio.repository.HoldingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HoldingServiceTest {

    @Mock
    private HoldingRepository holdingRepository;

    @Mock
    private PortfolioService portfolioService;

    @InjectMocks
    private HoldingService holdingService;

    private Portfolio testPortfolio;
    private Holding testHolding;
    private final UUID portfolioId = UUID.randomUUID();
    private final UUID holdingId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        var user = new User();
        user.setId(UUID.randomUUID());

        testPortfolio = new Portfolio();
        testPortfolio.setId(portfolioId);
        testPortfolio.setUser(user);

        testHolding = new Holding();
        testHolding.setId(holdingId);
        testHolding.setPortfolio(testPortfolio);
        testHolding.setTickerSymbol("AAPL");
        testHolding.setAssetType(Holding.AssetType.STOCK);
        testHolding.setQuantity(new BigDecimal("50"));
        testHolding.setAverageCost(new BigDecimal("178.50"));
    }

    @Test
    void addHolding_shouldAddSuccessfully() {
        var request = new AddHoldingRequest("AAPL", "STOCK", new BigDecimal("50"), new BigDecimal("178.50"));
        when(portfolioService.findPortfolioOrThrow(portfolioId)).thenReturn(testPortfolio);
        when(holdingRepository.existsByPortfolioIdAndTickerSymbol(portfolioId, "AAPL")).thenReturn(false);
        when(holdingRepository.save(any(Holding.class))).thenReturn(testHolding);

        var response = holdingService.addHolding(portfolioId, request);

        assertThat(response.tickerSymbol()).isEqualTo("AAPL");
        assertThat(response.quantity()).isEqualByComparingTo(new BigDecimal("50"));
    }

    @Test
    void addHolding_shouldThrowOnDuplicate() {
        var request = new AddHoldingRequest("AAPL", "STOCK", new BigDecimal("50"), new BigDecimal("178.50"));
        when(portfolioService.findPortfolioOrThrow(portfolioId)).thenReturn(testPortfolio);
        when(holdingRepository.existsByPortfolioIdAndTickerSymbol(portfolioId, "AAPL")).thenReturn(true);

        assertThatThrownBy(() -> holdingService.addHolding(portfolioId, request))
            .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void getHoldings_shouldReturnList() {
        when(portfolioService.findPortfolioOrThrow(portfolioId)).thenReturn(testPortfolio);
        when(holdingRepository.findByPortfolioId(portfolioId)).thenReturn(List.of(testHolding));

        var result = holdingService.getHoldings(portfolioId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).tickerSymbol()).isEqualTo("AAPL");
    }

    @Test
    void updateHolding_shouldUpdate() {
        var request = new UpdateHoldingRequest(new BigDecimal("100"), new BigDecimal("175.00"));
        when(holdingRepository.findById(holdingId)).thenReturn(Optional.of(testHolding));
        when(holdingRepository.save(any(Holding.class))).thenReturn(testHolding);

        holdingService.updateHolding(holdingId, request);

        verify(holdingRepository).save(any(Holding.class));
    }

    @Test
    void deleteHolding_shouldThrowWhenNotFound() {
        when(holdingRepository.findById(holdingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> holdingService.deleteHolding(holdingId))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
