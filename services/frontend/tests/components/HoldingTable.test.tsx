import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoldingTable } from '../../src/components/portfolio/HoldingTable';
import type { Holding } from '../../src/types/portfolio';

const mockHoldings: Holding[] = [
  {
    id: '1',
    portfolioId: 'p1',
    tickerSymbol: 'AAPL',
    assetType: 'STOCK',
    quantity: 50,
    averageCost: 178.5,
    totalCost: 8925,
    acquiredAt: '2024-01-15',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    portfolioId: 'p1',
    tickerSymbol: 'VOO',
    assetType: 'ETF',
    quantity: 100,
    averageCost: 452.3,
    totalCost: 45230,
    acquiredAt: '2024-02-01',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

describe('HoldingTable', () => {
  it('renders holdings', () => {
    render(<HoldingTable holdings={mockHoldings} />);
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('VOO')).toBeInTheDocument();
  });

  it('shows empty message when no holdings', () => {
    render(<HoldingTable holdings={[]} />);
    expect(screen.getByText('No holdings yet.')).toBeInTheDocument();
  });

  it('renders asset type badges', () => {
    render(<HoldingTable holdings={mockHoldings} />);
    expect(screen.getByText('STOCK')).toBeInTheDocument();
    expect(screen.getByText('ETF')).toBeInTheDocument();
  });
});
