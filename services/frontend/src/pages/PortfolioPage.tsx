import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { holdingApi, portfolioApi } from '../api/portfolioApi';
import { HoldingTable } from '../components/portfolio/HoldingTable';
import { AddHoldingForm } from '../components/portfolio/AddHoldingForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PortfolioList } from '../components/portfolio/PortfolioList';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import type { Portfolio, PortfolioSummary, AddHoldingRequest } from '../types/portfolio';

export function PortfolioPage() {
  const { portfolioId } = useParams<{ portfolioId: string }>();

  if (portfolioId) {
    return <PortfolioDetail portfolioId={portfolioId} />;
  }
  return <PortfolioListView />;
}

function PortfolioListView() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    portfolioApi.list(user.id).then(setPortfolios).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Portfolios</h1>
      <PortfolioList portfolios={portfolios} />
    </div>
  );
}

function PortfolioDetail({ portfolioId }: { portfolioId: string }) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingHolding, setAddingHolding] = useState(false);

  const loadPortfolio = () => {
    portfolioApi.getById(portfolioId).then(setPortfolio).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPortfolio();
  }, [portfolioId]);

  const handleAddHolding = async (data: AddHoldingRequest) => {
    setAddingHolding(true);
    try {
      await holdingApi.add(portfolioId, data);
      loadPortfolio();
    } catch (err) {
      console.error('Failed to add holding:', err);
    } finally {
      setAddingHolding(false);
    }
  };

  const handleDeleteHolding = async (holdingId: string) => {
    await holdingApi.delete(holdingId);
    loadPortfolio();
  };

  if (loading) return <LoadingSpinner />;
  if (!portfolio) return <p className="text-slate-500">Portfolio not found.</p>;

  const totalCost = portfolio.holdings.reduce((sum, h) => sum + h.totalCost, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{portfolio.name}</h1>
      {portfolio.description && <p className="text-slate-500 mt-1">{portfolio.description}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-slate-500">Total Cost Basis</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalCost)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-slate-500">Holdings</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{portfolio.holdings.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-slate-500">Currency</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{portfolio.currency}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Holding</h2>
        <AddHoldingForm onSubmit={handleAddHolding} loading={addingHolding} />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Holdings</h2>
        <HoldingTable holdings={portfolio.holdings} onDelete={handleDeleteHolding} />
      </div>
    </div>
  );
}
