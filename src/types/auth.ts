
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthSession {
  user: User
  token: string
}
