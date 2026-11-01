
import axios from 'axios'

const SESSION_STORAGE_KEY = 'greenmint_session_id'
export const AUTH_TOKEN_KEY = 'greenmint_auth_token'

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
  }

  return sessionId
}

export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Envia a identificação da sessão e o token de autenticação.
api.interceptors.request.use((config) => {
  config.headers.set('x-session-id', getSessionId())

  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})
