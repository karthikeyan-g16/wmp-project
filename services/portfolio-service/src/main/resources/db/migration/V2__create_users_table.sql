CREATE TABLE portfolio_schema.users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(255) NOT NULL,
    risk_profile VARCHAR(50) NOT NULL DEFAULT 'MODERATE'
                CHECK (risk_profile IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON portfolio_schema.users(email);
