
import { api } from '../lib/api'
import type {
  Cart,
  AddCartItemInput,
  UpdateCartItemInput,
} from '../types/cart'

export const cartService = {
  // Buscar carrinho
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>('/cart')
    return response.data
  },

  // Adicionar NFT ao carrinho
  async addItem(input: AddCartItemInput): Promise<Cart> {
    const response = await api.post<Cart>(
      '/cart/items',
      input
    )

    return response.data
  },

  // Atualizar quantidade
  async updateItem(input: UpdateCartItemInput): Promise<Cart> {
    const response = await api.patch<Cart>(
      `/cart/items/${encodeURIComponent(input.nftId)}`,
      { quantity: input.quantity }
    )

    return response.data
  },

    async removeItem(nftId: string): Promise<Cart> {
    const response = await api.delete<Cart>(
      `/cart/items/${encodeURIComponent(nftId)}`
    )

    return response.data
  },

  async applyCoupon(code: string): Promise<Cart> {
    const response = await api.post<Cart>('/cart/coupon', { code })
    return response.data
  },

  async removeCoupon(): Promise<Cart> {
    const response = await api.delete<Cart>('/cart/coupon')
    return response.data
  },
}



  