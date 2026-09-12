import { portfolioClient } from './httpClient';
import type {
  AddHoldingRequest,
  CreatePortfolioRequest,
  CreateUserRequest,
  Holding,
  Portfolio,
  PortfolioSummary,
  User,
} from '../types/portfolio';

export const userApi = {
  create: (data: CreateUserRequest) =>
    portfolioClient.post<User>('/api/v1/users', data).then((r) => r.data),

  getById: (userId: string) =>
    portfolioClient.get<User>(`/api/v1/users/${userId}`).then((r) => r.data),

  getByEmail: (email: string) =>
    portfolioClient.get<User>('/api/v1/users', { params: { email } }).then((r) => r.data),
};

export const portfolioApi = {
  create: (userId: string, data: CreatePortfolioRequest) =>
    portfolioClient.post<Portfolio>(`/api/v1/users/${userId}/portfolios`, data).then((r) => r.data),

  list: (userId: string) =>
    portfolioClient.get<PortfolioSummary[]>(`/api/v1/users/${userId}/portfolios`).then((r) => r.data),

  getById: (portfolioId: string) =>
    portfolioClient.get<Portfolio>(`/api/v1/portfolios/${portfolioId}`).then((r) => r.data),

  update: (portfolioId: string, data: CreatePortfolioRequest) =>
    portfolioClient.put<Portfolio>(`/api/v1/portfolios/${portfolioId}`, data).then((r) => r.data),

  delete: (portfolioId: string) =>
    portfolioClient.delete(`/api/v1/portfolios/${portfolioId}`),
};

export const holdingApi = {
  add: (portfolioId: string, data: AddHoldingRequest) =>
    portfolioClient.post<Holding>(`/api/v1/portfolios/${portfolioId}/holdings`, data).then((r) => r.data),

  list: (portfolioId: string) =>
    portfolioClient.get<Holding[]>(`/api/v1/portfolios/${portfolioId}/holdings`).then((r) => r.data),

  update: (holdingId: string, data: { quantity: number; averageCost: number }) =>
    portfolioClient.put<Holding>(`/api/v1/holdings/${holdingId}`, data).then((r) => r.data),

  delete: (holdingId: string) =>
    portfolioClient.delete(`/api/v1/holdings/${holdingId}`),
};
