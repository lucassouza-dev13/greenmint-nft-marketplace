
import axios from 'axios'

const SESSION_STORAGE_KEY = 'greenmint_session_id'

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

// Envia a identificação da sessão em todas as requisições.
api.interceptors.request.use((config) => {
  config.headers.set('x-session-id', getSessionId())

  return config
})
