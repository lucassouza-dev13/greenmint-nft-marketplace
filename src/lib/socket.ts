
import { io } from 'socket.io-client'

export const socket = io(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  }
)
