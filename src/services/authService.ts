
import { api } from '../lib/api'
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '../types/auth'

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/auth/register',
      input
    )
    return data
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/auth/login',
      input
    )
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me')
    return data.user
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
