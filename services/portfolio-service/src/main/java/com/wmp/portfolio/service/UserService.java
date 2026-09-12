package com.wmp.portfolio.service;

import com.wmp.portfolio.dto.request.CreateUserRequest;
import com.wmp.portfolio.dto.response.UserResponse;
import com.wmp.portfolio.entity.Holding;
import com.wmp.portfolio.entity.Portfolio;
import com.wmp.portfolio.entity.User;
import com.wmp.portfolio.exception.DuplicateResourceException;
import com.wmp.portfolio.exception.ResourceNotFoundException;
import com.wmp.portfolio.repository.HoldingRepository;
import com.wmp.portfolio.repository.PortfolioRepository;
import com.wmp.portfolio.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;

    public UserService(UserRepository userRepository,
                       PortfolioRepository portfolioRepository,
                       HoldingRepository holdingRepository) {
        this.userRepository = userRepository;
        this.portfolioRepository = portfolioRepository;
        this.holdingRepository = holdingRepository;
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("User with email " + request.email() + " already exists");
        }

        var user = new User();
        user.setId(request.id() != null ? request.id() : UUID.randomUUID());
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        if (request.riskProfile() != null) {
            user.setRiskProfile(User.RiskProfile.valueOf(request.riskProfile().toUpperCase()));
        }

        user = userRepository.save(user);
        log.info("User created: id={}, email={}", user.getId(), user.getEmail());

        seedStarterPortfolio(user);

        return toResponse(user);
    }

    private void seedStarterPortfolio(User user) {
        var portfolio = new Portfolio();
        portfolio.setUser(user);
        portfolio.setName("Starter Portfolio");
        portfolio.setDescription("Your first investment portfolio");
        portfolio.setCurrency("USD");
        portfolio = portfolioRepository.save(portfolio);

        addSeedHolding(portfolio, "AAPL", Holding.AssetType.STOCK, "15", "195.50");
        addSeedHolding(portfolio, "GOOGL", Holding.AssetType.STOCK, "10", "175.25");
        addSeedHolding(portfolio, "MSFT", Holding.AssetType.STOCK, "12", "420.80");
        addSeedHolding(portfolio, "VOO", Holding.AssetType.ETF, "25", "480.00");
        addSeedHolding(portfolio, "BND", Holding.AssetType.BOND, "50", "72.50");

        log.info("Seeded starter portfolio: id={}, userId={}", portfolio.getId(), user.getId());
    }

    private void addSeedHolding(Portfolio portfolio, String ticker, Holding.AssetType type,
                                String quantity, String avgCost) {
        var holding = new Holding();
        holding.setPortfolio(portfolio);
        holding.setTickerSymbol(ticker);
        holding.setAssetType(type);
        holding.setQuantity(new BigDecimal(quantity));
        holding.setAverageCost(new BigDecimal(avgCost));
        holdingRepository.save(holding);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        return toResponse(findUserOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRiskProfile().name(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
