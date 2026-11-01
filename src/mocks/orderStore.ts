
import type { Order } from '../types/order'

const STORAGE_KEY = 'greenmint_mock_orders_v1'

type StoredOrders = {
  orders: Record<string, Order>
  idempotencyKeys: Record<string, string>
  orderOwners: Record<string, string>
}

// Pedidos armazenados pela API simulada.
export const orders = new Map<string, Order>()

// Relaciona cada tentativa de compra ao pedido criado.
export const idempotencyKeys = new Map<string, string>()

// Relaciona cada pedido à sessão responsável.
export const orderOwners = new Map<string, string>()

function loadStoredOrders(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return

    const stored = JSON.parse(raw) as Partial<StoredOrders>

    for (const [id, order] of Object.entries(
      stored.orders ?? {}
    )) {
      if (order && order.id === id) {
        orders.set(id, order)
      }
    }

    for (const [key, orderId] of Object.entries(
      stored.idempotencyKeys ?? {}
    )) {
      if (
        typeof orderId === 'string' &&
        orders.has(orderId)
      ) {
        idempotencyKeys.set(key, orderId)
      }
    }

    for (const [orderId, sessionId] of Object.entries(
      stored.orderOwners ?? {}
    )) {
      if (
        typeof sessionId === 'string' &&
        orders.has(orderId)
      ) {
        orderOwners.set(orderId, sessionId)
      }
    }
  } catch (error) {
    console.error(
      '[GreenMint] Erro ao carregar pedidos:',
      error
    )
  }
}

function saveStoredOrders(): void {
  const data: StoredOrders = {
    orders: Object.fromEntries(orders),
    idempotencyKeys: Object.fromEntries(idempotencyKeys),
    orderOwners: Object.fromEntries(orderOwners),
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    )
  } catch (error) {
    console.error(
      '[GreenMint] Erro ao salvar pedidos:',
      error
    )
  }
}

// Carrega os pedidos salvos ao iniciar a aplicação.
loadStoredOrders()

export function generateOrderId(): string {
  return `GM-${crypto.randomUUID()}`
}

export function findOrder(
  orderId: string
): Order | undefined {
  return orders.get(orderId)
}

export function findOrderByIdempotencyKey(
  sessionId: string,
  key: string
): Order | undefined {
  const orderId = idempotencyKeys.get(
    `${sessionId}:${key}`
  )

  return orderId ? orders.get(orderId) : undefined
}

export function isOrderOwner(
  orderId: string,
  sessionId: string
): boolean {
  return orderOwners.get(orderId) === sessionId
}

export function saveOrder(
  sessionId: string,
  key: string,
  order: Order
): void {
  orders.set(order.id, order)

  idempotencyKeys.set(
    `${sessionId}:${key}`,
    order.id
  )

  orderOwners.set(order.id, sessionId)

  saveStoredOrders()
}
