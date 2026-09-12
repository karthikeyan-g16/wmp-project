-- Seed a demo user and portfolio for local development
INSERT INTO portfolio_schema.users (id, email, full_name, risk_profile)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@wmp.com', 'Demo User', 'MODERATE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO portfolio_schema.portfolios (id, user_id, name, description, currency)
VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Growth Portfolio', 'Long-term growth investments', 'USD')
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO portfolio_schema.holdings (portfolio_id, ticker_symbol, asset_type, quantity, average_cost) VALUES
('00000000-0000-0000-0000-000000000010', 'AAPL', 'STOCK', 50, 178.50),
('00000000-0000-0000-0000-000000000010', 'GOOGL', 'STOCK', 20, 141.25),
('00000000-0000-0000-0000-000000000010', 'MSFT', 'STOCK', 30, 378.90),
('00000000-0000-0000-0000-000000000010', 'VOO', 'ETF', 100, 452.30),
('00000000-0000-0000-0000-000000000010', 'BND', 'BOND', 200, 72.15)
ON CONFLICT (portfolio_id, ticker_symbol) DO NOTHING;
