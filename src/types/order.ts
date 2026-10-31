
import type { CartItem } from './cart'

export type WalletProvider =
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'

export type PaymentNetwork =
  | 'ethereum'
  | 'polygon'
  | 'solana'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'failed'

export interface CreateOrderInput {
  walletProvider: WalletProvider
  walletAddress: string
  network: PaymentNetwork
  idempotencyKey: string
}

export interface Order {
  id: string
  status: OrderStatus

  items: CartItem[]

  walletProvider: WalletProvider
  walletAddress: string
  network: PaymentNetwork

  subtotalEth: string
  discountEth: string
  totalEth: string
  couponCode: string | null

  createdAt: string
  updatedAt: string
}
