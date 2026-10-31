
import { api } from '../lib/api'

import type {
  CreateOrderInput,
  Order,
} from '../types/order'

export const orderService = {
  // Criar pedido pela API
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const response = await api.post<Order>(
      '/orders',
      input
    )

    return response.data
  },

  // Consultar pedido pelo identificador
  async getOrder(orderId: string): Promise<Order> {
    const response = await api.get<Order>(
      `/orders/${encodeURIComponent(orderId)}`
    )

    return response.data
  },
}
