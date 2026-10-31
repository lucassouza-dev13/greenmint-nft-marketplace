
import type { Order } from '../types/order'

// Pedidos armazenados pela API simulada
export const orders = new Map<string, Order>()

// Relaciona cada tentativa de compra ao pedido criado
export const idempotencyKeys = new Map<string, string>()

// Gera um identificador para cada pedido
export function generateOrderId(): string {
  return `GM-${crypto.randomUUID()}`
}

// Busca um pedido pelo identificador
export function findOrder(orderId: string): Order | undefined {
  return orders.get(orderId)
}

// Busca um pedido criado com a mesma chave de idempotência
export function findOrderByIdempotencyKey(
  sessionId: string,
  key: string
): Order | undefined {
  const orderId = idempotencyKeys.get(`${sessionId}:${key}`)

  return orderId ? orders.get(orderId) : undefined
}

// Registra um pedido e sua chave de idempotência
export function saveOrder(
  sessionId: string,
  key: string,
  order: Order
): void {
  orders.set(order.id, order)
  idempotencyKeys.set(`${sessionId}:${key}`, order.id)
}
