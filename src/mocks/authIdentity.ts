
import type { User } from '../types/auth'

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

export function getAuthenticatedUserId(
  request: Request
): string | null {
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  const token = authorization.slice(7)

  const sessions = readStorage<StoredSession[]>(
    SESSIONS_KEY,
    []
  )

  const session = sessions.find(
    (item) => item.token === token
  )

  if (!session) return null

  const users = readStorage<User[]>(USERS_KEY, [])

  const userExists = users.some(
    (user) => user.id === session.userId
  )

  return userExists ? session.userId : null
}

export function getCartOwnerId(request: Request): string {
  const userId = getAuthenticatedUserId(request)

  if (userId) {
    return `user:${userId}`
  }

  const sessionId = request.headers.get('x-session-id')

  return `guest:${sessionId ?? 'anonymous'}`
}
