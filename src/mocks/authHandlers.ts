
import { http, HttpResponse } from 'msw'
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '../types/auth'

type StoredUser = User & {
  passwordHash: string
  salt: string
}

type StoredSession = {
  userId: string
  token: string
}

const USERS_KEY = 'greenmint_mock_users_v1'
const SESSIONS_KEY = 'greenmint_mock_auth_sessions_v1'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

const users = readStorage<StoredUser[]>(USERS_KEY, [])
const sessions = readStorage<StoredSession[]>(SESSIONS_KEY, [])

function persist(): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function getToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice(7)
}

function getAuthenticatedUser(request: Request): User | null {
  const token = getToken(request)
  if (!token) return null

  const session = sessions.find((item) => item.token === token)
  if (!session) return null

  const user = users.find((item) => item.id === session.userId)
  return user ? publicUser(user) : null
}

function errorResponse(
  code: string,
  message: string,
  status: number
) {
  return HttpResponse.json({ code, message }, { status })
}

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    let input: Partial<RegisterInput>

    try {
      input = (await request.json()) as Partial<RegisterInput>
    } catch {
      return errorResponse(
        'INVALID_BODY',
        'Dados de cadastro inválidos.',
        400
      )
    }

    const name = input.name?.trim() ?? ''
    const email = input.email?.trim().toLowerCase() ?? ''
    const password = input.password ?? ''

    if (
      name.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 6
    ) {
      return errorResponse(
        'INVALID_REGISTER',
        'Informe nome, e-mail e senha de pelo menos 6 caracteres.',
        400
      )
    }

    if (users.some((user) => user.email === email)) {
      return errorResponse(
        'EMAIL_EXISTS',
        'Este e-mail já está cadastrado.',
        409
      )
    }

    const salt = crypto.randomUUID()
    const passwordHash = await hashPassword(password, salt)

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    }

    users.push(user)

    const token = crypto.randomUUID()
    sessions.push({ userId: user.id, token })
    persist()

    const response: AuthResponse = {
      user: publicUser(user),
      token,
    }

    return HttpResponse.json(response, { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    let input: Partial<LoginInput>

    try {
      input = (await request.json()) as Partial<LoginInput>
    } catch {
      return errorResponse(
        'INVALID_BODY',
        'Dados de login inválidos.',
        400
      )
    }

    const email = input.email?.trim().toLowerCase() ?? ''
    const password = input.password ?? ''

    const user = users.find((item) => item.email === email)

    if (
      !user ||
      (await hashPassword(password, user.salt)) !== user.passwordHash
    ) {
      return errorResponse(
        'INVALID_CREDENTIALS',
        'E-mail ou senha incorretos.',
        401
      )
    }

    const token = crypto.randomUUID()
    sessions.push({ userId: user.id, token })
    persist()

    const response: AuthResponse = {
      user: publicUser(user),
      token,
    }

    return HttpResponse.json(response)
  }),

  http.get('/api/auth/me', ({ request }) => {
    const user = getAuthenticatedUser(request)

    if (!user) {
      return errorResponse(
        'UNAUTHORIZED',
        'Sessão inválida ou expirada.',
        401
      )
    }

    return HttpResponse.json({ user })
  }),

  http.post('/api/auth/logout', ({ request }) => {
    const token = getToken(request)

    if (token) {
      const index = sessions.findIndex(
        (session) => session.token === token
      )

      if (index !== -1) {
        sessions.splice(index, 1)
        persist()
      }
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
