package com.wmp.portfolio.service;

import com.wmp.portfolio.dto.request.CreatePortfolioRequest;
import com.wmp.portfolio.dto.response.HoldingResponse;
import com.wmp.portfolio.dto.response.PortfolioResponse;
import com.wmp.portfolio.dto.response.PortfolioSummaryResponse;
import com.wmp.portfolio.entity.Holding;
import com.wmp.portfolio.entity.Portfolio;
import com.wmp.portfolio.exception.DuplicateResourceException;
import com.wmp.portfolio.exception.ResourceNotFoundException;
import com.wmp.portfolio.repository.PortfolioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PortfolioService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioService.class);

    private final PortfolioRepository portfolioRepository;
    private final UserService userService;

    public PortfolioService(PortfolioRepository portfolioRepository, UserService userService) {
        this.portfolioRepository = portfolioRepository;
        this.userService = userService;
    }

    @Transactional
    public PortfolioResponse createPortfolio(UUID userId, CreatePortfolioRequest request) {
        var user = userService.findUserOrThrow(userId);

        if (portfolioRepository.existsByUserIdAndName(userId, request.name())) {
            throw new DuplicateResourceException("Portfolio '" + request.name() + "' already exists for this user");
        }

        var portfolio = new Portfolio();
        portfolio.setUser(user);
        portfolio.setName(request.name());
        portfolio.setDescription(request.description());
        if (request.currency() != null) {
            portfolio.setCurrency(request.currency());
        }

        portfolio = portfolioRepository.save(portfolio);
        log.info("Portfolio created: id={}, userId={}, name={}", portfolio.getId(), userId, portfolio.getName());

        return toResponse(portfolio);
    }

    @Transactional(readOnly = true)
    public List<PortfolioSummaryResponse> getUserPortfolios(UUID userId) {
        userService.findUserOrThrow(userId);
        return portfolioRepository.findByUserId(userId).stream()
            .map(this::toSummaryResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioById(UUID portfolioId) {
        return toResponse(findPortfolioOrThrow(portfolioId));
    }

    @Transactional
    public PortfolioResponse updatePortfolio(UUID portfolioId, CreatePortfolioRequest request) {
        var portfolio = findPortfolioOrThrow(portfolioId);
        if (request.name() != null) portfolio.setName(request.name());
        if (request.description() != null) portfolio.setDescription(request.description());

        portfolio = portfolioRepository.save(portfolio);
        log.info("Portfolio updated: id={}", portfolioId);

        return toResponse(portfolio);
    }

    @Transactional
    public void deletePortfolio(UUID portfolioId) {
        var portfolio = findPortfolioOrThrow(portfolioId);
        portfolioRepository.delete(portfolio);
        log.info("Portfolio deleted: id={}", portfolioId);
    }

    public Portfolio findPortfolioOrThrow(UUID portfolioId) {
        return portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new ResourceNotFoundException("Portfolio", "id", portfolioId));
    }

    private PortfolioResponse toResponse(Portfolio p) {
        List<HoldingResponse> holdings = p.getHoldings().stream().map(this::toHoldingResponse).toList();
        return new PortfolioResponse(
            p.getId(), p.getUser().getId(), p.getName(), p.getDescription(),
            p.getCurrency(), p.getStatus().name(), holdings, p.getCreatedAt(), p.getUpdatedAt()
        );
    }

    private PortfolioSummaryResponse toSummaryResponse(Portfolio p) {
        return new PortfolioSummaryResponse(
            p.getId(), p.getName(), p.getCurrency(), p.getStatus().name(),
            p.getHoldings().size(), p.getCreatedAt()
        );
    }

    private HoldingResponse toHoldingResponse(Holding h) {
        return new HoldingResponse(
            h.getId(), h.getPortfolio().getId(), h.getTickerSymbol(), h.getAssetType().name(),
            h.getQuantity(), h.getAverageCost(), h.getQuantity().multiply(h.getAverageCost()),
            h.getAcquiredAt(), h.getCreatedAt(), h.getUpdatedAt()
        );
    }
}
