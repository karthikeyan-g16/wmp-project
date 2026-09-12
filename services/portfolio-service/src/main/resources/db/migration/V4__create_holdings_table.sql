CREATE TABLE portfolio_schema.holdings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id    UUID NOT NULL REFERENCES portfolio_schema.portfolios(id) ON DELETE CASCADE,
    ticker_symbol   VARCHAR(20) NOT NULL,
    asset_type      VARCHAR(30) NOT NULL
                    CHECK (asset_type IN ('STOCK', 'BOND', 'ETF', 'MUTUAL_FUND', 'CRYPTO', 'COMMODITY')),
    quantity        NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
    average_cost    NUMERIC(18, 4) NOT NULL CHECK (average_cost >= 0),
    acquired_at     DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(portfolio_id, ticker_symbol)
);

CREATE INDEX idx_holdings_portfolio_id ON portfolio_schema.holdings(portfolio_id);
CREATE INDEX idx_holdings_ticker ON portfolio_schema.holdings(ticker_symbol);
