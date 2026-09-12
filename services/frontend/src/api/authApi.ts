import { authClient } from './httpClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/portfolio';

export const authApi = {
  register: (data: RegisterRequest) =>
    authClient.post<AuthResponse>('/api/v1/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    authClient.post<AuthResponse>('/api/v1/auth/login', data).then((r) => r.data),
};
