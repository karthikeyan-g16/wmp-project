CREATE TABLE portfolio_schema.portfolios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES portfolio_schema.users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    currency    VARCHAR(3) NOT NULL DEFAULT 'USD',
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE', 'CLOSED', 'FROZEN')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_portfolios_user_id ON portfolio_schema.portfolios(user_id);
CREATE INDEX idx_portfolios_status ON portfolio_schema.portfolios(status);
