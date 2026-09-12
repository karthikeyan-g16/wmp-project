package com.wmp.portfolio.service;

import com.wmp.portfolio.dto.request.AddHoldingRequest;
import com.wmp.portfolio.dto.request.UpdateHoldingRequest;
import com.wmp.portfolio.dto.response.HoldingResponse;
import com.wmp.portfolio.entity.Holding;
import com.wmp.portfolio.exception.DuplicateResourceException;
import com.wmp.portfolio.exception.ResourceNotFoundException;
import com.wmp.portfolio.repository.HoldingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class HoldingService {

    private static final Logger log = LoggerFactory.getLogger(HoldingService.class);

    private final HoldingRepository holdingRepository;
    private final PortfolioService portfolioService;

    public HoldingService(HoldingRepository holdingRepository, PortfolioService portfolioService) {
        this.holdingRepository = holdingRepository;
        this.portfolioService = portfolioService;
    }

    @Transactional
    public HoldingResponse addHolding(UUID portfolioId, AddHoldingRequest request) {
        var portfolio = portfolioService.findPortfolioOrThrow(portfolioId);

        if (holdingRepository.existsByPortfolioIdAndTickerSymbol(portfolioId, request.tickerSymbol())) {
            throw new DuplicateResourceException("Holding for " + request.tickerSymbol() + " already exists in this portfolio");
        }

        var holding = new Holding();
        holding.setPortfolio(portfolio);
        holding.setTickerSymbol(request.tickerSymbol().toUpperCase());
        holding.setAssetType(Holding.AssetType.valueOf(request.assetType().toUpperCase()));
        holding.setQuantity(request.quantity());
        holding.setAverageCost(request.averageCost());

        holding = holdingRepository.save(holding);
        log.info("Holding added: id={}, portfolioId={}, ticker={}", holding.getId(), portfolioId, holding.getTickerSymbol());

        return toResponse(holding);
    }

    @Transactional(readOnly = true)
    public List<HoldingResponse> getHoldings(UUID portfolioId) {
        portfolioService.findPortfolioOrThrow(portfolioId);
        return holdingRepository.findByPortfolioId(portfolioId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public HoldingResponse updateHolding(UUID holdingId, UpdateHoldingRequest request) {
        var holding = findHoldingOrThrow(holdingId);

        holding.setQuantity(request.quantity());
        holding.setAverageCost(request.averageCost());
        holding = holdingRepository.save(holding);
        log.info("Holding updated: id={}, ticker={}", holdingId, holding.getTickerSymbol());

        return toResponse(holding);
    }

    @Transactional
    public void deleteHolding(UUID holdingId) {
        var holding = findHoldingOrThrow(holdingId);
        var ticker = holding.getTickerSymbol();

        holdingRepository.delete(holding);
        log.info("Holding removed: id={}, ticker={}", holdingId, ticker);
    }

    private Holding findHoldingOrThrow(UUID holdingId) {
        return holdingRepository.findById(holdingId)
            .orElseThrow(() -> new ResourceNotFoundException("Holding", "id", holdingId));
    }

    private HoldingResponse toResponse(Holding h) {
        return new HoldingResponse(
            h.getId(), h.getPortfolio().getId(), h.getTickerSymbol(), h.getAssetType().name(),
            h.getQuantity(), h.getAverageCost(), h.getQuantity().multiply(h.getAverageCost()),
            h.getAcquiredAt(), h.getCreatedAt(), h.getUpdatedAt()
        );
    }
}
