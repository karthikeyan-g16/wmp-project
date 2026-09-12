import { FormEvent, useState } from 'react';
import { ASSET_TYPES } from '../../utils/constants';
import type { AddHoldingRequest } from '../../types/portfolio';

interface AddHoldingFormProps {
  onSubmit: (data: AddHoldingRequest) => void;
  loading?: boolean;
}

export function AddHoldingForm({ onSubmit, loading }: AddHoldingFormProps) {
  const [ticker, setTicker] = useState('');
  const [assetType, setAssetType] = useState<string>('STOCK');
  const [quantity, setQuantity] = useState('');
  const [averageCost, setAverageCost] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      tickerSymbol: ticker.toUpperCase(),
      assetType,
      quantity: parseFloat(quantity),
      averageCost: parseFloat(averageCost),
    });
    setTicker('');
    setQuantity('');
    setAverageCost('');
  };

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition';

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="min-w-[120px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Ticker</label>
        <input className={inputClass} value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="AAPL" required />
      </div>
      <div className="min-w-[140px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
        <select className={inputClass} value={assetType} onChange={(e) => setAssetType(e.target.value)}>
          {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="min-w-[100px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
        <input className={inputClass} type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      </div>
      <div className="min-w-[100px]">
        <label className="block text-xs font-medium text-slate-500 mb-1">Avg Cost</label>
        <input className={inputClass} type="number" step="0.01" min="0" value={averageCost} onChange={(e) => setAverageCost(e.target.value)} required />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add Holding'}
      </button>
    </form>
  );
}
