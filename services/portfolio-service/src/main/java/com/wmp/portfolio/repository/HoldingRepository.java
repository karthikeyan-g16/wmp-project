package com.wmp.portfolio.repository;

import com.wmp.portfolio.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface HoldingRepository extends JpaRepository<Holding, UUID> {
    List<Holding> findByPortfolioId(UUID portfolioId);
    boolean existsByPortfolioIdAndTickerSymbol(UUID portfolioId, String tickerSymbol);
}
