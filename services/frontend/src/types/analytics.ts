export interface MarketData {
  id: string;
  ticker_symbol: string;
  price: number;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  volume: number | null;
  price_date: string;
  source: string;
}

export interface Valuation {
  id: string;
  portfolio_id: string;
  valuation_date: string;
  total_value: number;
  total_cost: number;
  gain_loss: number;
  gain_loss_pct: number | null;
  currency: string;
}

export interface AnalyticsSnapshot {
  id: string;
  portfolio_id: string;
  snapshot_date: string;
  total_value: number;
  daily_return_pct: number | null;
  cumulative_return: number | null;
  sharpe_ratio: number | null;
  volatility: number | null;
  max_drawdown: number | null;
  allocation_json: Record<string, number>;
  top_performers: PerformerEntry[];
  bottom_performers: PerformerEntry[];
}

export interface PerformerEntry {
  ticker: string;
  pnl_pct: number;
  value: number;
}

export interface AllocationData {
  portfolio_id: string;
  allocations: Record<string, number>;
  total_value: number;
}
