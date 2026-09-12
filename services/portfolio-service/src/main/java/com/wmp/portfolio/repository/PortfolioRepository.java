package com.wmp.portfolio.repository;

import com.wmp.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserId(UUID userId);
    boolean existsByUserIdAndName(UUID userId, String name);
}
