package com.wmp.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "holdings", schema = "portfolio_schema",
       uniqueConstraints = @UniqueConstraint(columnNames = {"portfolio_id", "ticker_symbol"}))
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "ticker_symbol", nullable = false)
    private String tickerSymbol;

    @Column(name = "asset_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AssetType assetType;

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal quantity;

    @Column(name = "average_cost", nullable = false, precision = 18, scale = 4)
    private BigDecimal averageCost;

    @Column(name = "acquired_at", nullable = false)
    private LocalDate acquiredAt = LocalDate.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum AssetType {
        STOCK, BOND, ETF, MUTUAL_FUND, CRYPTO, COMMODITY
    }

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public String getTickerSymbol() { return tickerSymbol; }
    public void setTickerSymbol(String tickerSymbol) { this.tickerSymbol = tickerSymbol; }
    public AssetType getAssetType() { return assetType; }
    public void setAssetType(AssetType assetType) { this.assetType = assetType; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getAverageCost() { return averageCost; }
    public void setAverageCost(BigDecimal averageCost) { this.averageCost = averageCost; }
    public LocalDate getAcquiredAt() { return acquiredAt; }
    public void setAcquiredAt(LocalDate acquiredAt) { this.acquiredAt = acquiredAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
