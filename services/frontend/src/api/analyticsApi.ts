import { analyticsClient } from './httpClient';
import type { AllocationData, AnalyticsSnapshot, MarketData, Valuation } from '../types/analytics';

export const marketDataApi = {
  getByTicker: (ticker: string) =>
    analyticsClient.get<MarketData[]>(`/api/v1/market-data/${ticker}`).then((r) => r.data),

  getLatest: (ticker: string) =>
    analyticsClient.get<MarketData>(`/api/v1/market-data/${ticker}/latest`).then((r) => r.data),
};

export const valuationApi = {
  list: (portfolioId: string) =>
    analyticsClient.get<Valuation[]>(`/api/v1/valuations/${portfolioId}`).then((r) => r.data),

  getLatest: (portfolioId: string) =>
    analyticsClient.get<Valuation>(`/api/v1/valuations/${portfolioId}/latest`).then((r) => r.data),

  calculate: (portfolioId: string) =>
    analyticsClient.post<Valuation>(`/api/v1/valuations/${portfolioId}/calculate`).then((r) => r.data),
};

export const analyticsApi = {
  getSnapshot: (portfolioId: string) =>
    analyticsClient.get<AnalyticsSnapshot>(`/api/v1/analytics/${portfolioId}/snapshot`).then((r) => r.data),

  getAllocation: (portfolioId: string) =>
    analyticsClient.get<AllocationData>(`/api/v1/analytics/${portfolioId}/allocation`).then((r) => r.data),

  generateSnapshot: (portfolioId: string) =>
    analyticsClient.post<AnalyticsSnapshot>(`/api/v1/analytics/${portfolioId}/snapshot/generate`).then((r) => r.data),
};
