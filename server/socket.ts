
import { createServer } from 'node:http'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { Server } from 'socket.io'

const PORT = Number(process.env.SOCKET_PORT ?? 3001)
const EVENT_SECRET = process.env.SOCKET_EVENT_SECRET

const httpServer = createServer(async (request, response) => {
  if (request.url === '/health' && request.method === 'GET') {
    response.writeHead(200, {
      'Content-Type': 'application/json',
    })

    response.end(
      JSON.stringify({
        status: 'ok',
        service: 'greenmint-socket',
      })
    )
    return
  }

  if (request.url === '/internal/events' && request.method === 'POST') {
    if (!EVENT_SECRET) {
      response.writeHead(503)
      response.end('Event publishing is not configured')
      return
    }

    const suppliedSecret = request.headers['x-event-secret']
    const received = typeof suppliedSecret === 'string'
      ? Buffer.from(suppliedSecret)
      : Buffer.alloc(0)
    const expected = Buffer.from(EVENT_SECRET)

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      response.writeHead(401)
      response.end('Unauthorized')
      return
    }

    try {
      let body = ''

      for await (const chunk of request) {
        body += chunk

        if (body.length > 10_000) {
          response.writeHead(413)
          response.end('Payload too large')
          return
        }
      }

      const event = JSON.parse(body)

      if (
        event.type === 'nft.updated' &&
        typeof event.nftId === 'string' &&
        Number.isSafeInteger(event.version) &&
        event.version >= 0
      ) {
        io.emit('nft.updated', {
          nftId: event.nftId,
          version: event.version,
        })
      } else {
        response.writeHead(400)
        response.end('Invalid event')
        return
      }

      response.writeHead(202, {
        'Content-Type': 'application/json',
      })
      response.end(JSON.stringify({ accepted: true, eventId: randomUUID() }))
    } catch {
      response.writeHead(400)
      response.end('Invalid JSON')
    }

    return
  }

  response.writeHead(404)
  response.end('Not found')
})

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Cliente conectado: ${socket.id}`)

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Cliente desconectado: ${reason}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(
    `[Socket.IO] Servidor disponível em http://localhost:${PORT}`
  )
})
