import { useEffect, useState, useMemo } from 'react';
import { portfolioApi } from '../api/portfolioApi';
import { marketDataApi } from '../api/analyticsApi';
import { AllocationPieChart } from '../components/analytics/AllocationPieChart';
import { PerformanceChart } from '../components/analytics/PerformanceChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { MarketData } from '../types/analytics';
import type { Portfolio } from '../types/portfolio';

export function AnalyticsPage() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);

  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  // Fetch all user portfolios with full details (includes holdings)
  useEffect(() => {
    if (!user) return;
    portfolioApi
      .list(user.id)
      .then(async (summaries) => {
        const details = await Promise.all(
          summaries.map((s) => portfolioApi.getById(s.id))
        );
        setPortfolios(details);
      })
      .catch((err) => console.error('Failed to load portfolios:', err))
      .finally(() => setLoadingPortfolios(false));
  }, [user]);

  // Compute allocation by asset type from all holdings across all portfolios
  const allocation = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    for (const p of portfolios) {
      for (const h of p.holdings) {
        const cost = h.quantity * h.averageCost;
        totals[h.assetType] = (totals[h.assetType] || 0) + cost;
        grandTotal += cost;
      }
    }
    if (grandTotal === 0) return {};
    const pcts: Record<string, number> = {};
    for (const [type, val] of Object.entries(totals)) {
      pcts[type] = Math.round((val / grandTotal) * 100);
    }
    return pcts;
  }, [portfolios]);

  // Extract unique tickers from all holdings
  const tickers = useMemo(() => {
    const set = new Set<string>();
    for (const p of portfolios) {
      for (const h of p.holdings) {
        set.add(h.tickerSymbol);
      }
    }
    return Array.from(set).sort();
  }, [portfolios]);

  // Auto-select first ticker when list is ready
  useEffect(() => {
    if (tickers.length > 0 && selectedTicker === null) {
      setSelectedTicker(tickers[0]);
    }
  }, [tickers, selectedTicker]);

  // Fetch market data for selected ticker
  useEffect(() => {
    if (!selectedTicker) return;
    setLoadingMarket(true);
    marketDataApi
      .getByTicker(selectedTicker)
      .then(setMarketData)
      .catch((err) => console.error('Failed to load market data:', err))
      .finally(() => setLoadingMarket(false));
  }, [selectedTicker]);

  if (loadingPortfolios) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h1>

      {tickers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-slate-500">No holdings found. Add holdings to your portfolios to see analytics.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Asset Allocation</h2>
              <AllocationPieChart data={allocation} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Price Performance</h2>
                <div className="flex gap-1 flex-wrap">
                  {tickers.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTicker(t)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                        selectedTicker === t
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {loadingMarket ? (
                <LoadingSpinner />
              ) : (
                <PerformanceChart data={marketData} ticker={selectedTicker ?? ''} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Market Data - {selectedTicker}
            </h2>
            {loadingMarket ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-left text-sm text-slate-500">
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 text-right font-medium">Price</th>
                      <th className="pb-3 pr-4 text-right font-medium">Open</th>
                      <th className="pb-3 pr-4 text-right font-medium">High</th>
                      <th className="pb-3 pr-4 text-right font-medium">Low</th>
                      <th className="pb-3 text-right font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {marketData.slice(0, 10).map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2.5 pr-4 text-slate-700">{d.price_date}</td>
                        <td className="py-2.5 pr-4 text-right font-semibold text-slate-900">
                          ${d.price.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-slate-600">
                          ${d.open_price?.toFixed(2) ?? '-'}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-slate-600">
                          ${d.high_price?.toFixed(2) ?? '-'}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-slate-600">
                          ${d.low_price?.toFixed(2) ?? '-'}
                        </td>
                        <td className="py-2.5 text-right text-slate-600">
                          {d.volume?.toLocaleString() ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
