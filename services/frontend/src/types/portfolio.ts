export interface User {
  id: string;
  email: string;
  fullName: string;
  riskProfile: string;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  currency: string;
  status: string;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  currency: string;
  status: string;
  holdingsCount: number;
  createdAt: string;
}

export interface Holding {
  id: string;
  portfolioId: string;
  tickerSymbol: string;
  assetType: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  acquiredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  riskProfile?: string;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  currency?: string;
}

export interface AddHoldingRequest {
  tickerSymbol: string;
  assetType: string;
  quantity: number;
  averageCost: number;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}
