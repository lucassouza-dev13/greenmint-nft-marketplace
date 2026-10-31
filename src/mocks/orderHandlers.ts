import { http, HttpResponse } from 'msw'

import { initialNFTs } from './fixtures/nfts'

import {
  findOrder,
  findOrderByIdempotencyKey,
  generateOrderId,
  saveOrder,
} from './orderStore'

import type {
  CreateOrderInput,
  Order,
  PaymentNetwork,
  WalletProvider,
} from '../types/order'

// Retorna erros padronizados da API
function errorResponse(
  code: string,
  message: string,
  status: number
) {
  return HttpResponse.json(
    { code, message },
    { status }
  )
}

const validWallets: WalletProvider[] = [
  'metamask',
  'walletconnect',
  'coinbase',
]

const validNetworks: PaymentNetwork[] = [
  'ethereum',
  'polygon',
  'solana',
]

// Valida os dados recebidos
function isValidOrderInput(
  input: Partial<CreateOrderInput>
): input is CreateOrderInput {
  return (
    validWallets.includes(
      input.walletProvider as WalletProvider
    ) &&
    validNetworks.includes(
      input.network as PaymentNetwork
    ) &&
    typeof input.walletAddress === 'string' &&
    input.walletAddress.trim().length > 0 &&
    typeof input.idempotencyKey === 'string' &&
    input.idempotencyKey.trim().length > 0
  )
}

export const orderHandlers = [
  // Criar pedido
  http.post('/api/orders', async ({ request }) => {
    const sessionId =
      request.headers.get('x-session-id') ?? 'guest'

    let input: Partial<CreateOrderInput>

    try {
      input =
        (await request.json()) as Partial<CreateOrderInput>
    } catch {
      return errorResponse(
        'INVALID_BODY',
        'Os dados enviados são inválidos.',
        400
      )
    }

    if (!isValidOrderInput(input)) {
      return errorResponse(
        'INVALID_ORDER',
        'Informe uma carteira, rede e chave de compra válidas.',
        400
      )
    }

    // Evita duplicação de pedidos
    const existingOrder = findOrderByIdempotencyKey(
      sessionId,
      input.idempotencyKey
    )

    if (existingOrder) {
      return HttpResponse.json(existingOrder)
    }

    // O carrinho será consultado pela API simulada
    const cartResponse = await fetch('/api/cart', {
      headers: {
        'x-session-id': sessionId,
      },
    })

    if (!cartResponse.ok) {
      return errorResponse(
        'CART_ERROR',
        'Não foi possível consultar o carrinho.',
        502
      )
    }

    const cart = (await cartResponse.json()) as {
      items: Array<{
        nftId: string
        quantity: number
        nft: {
          network: PaymentNetwork
        }
      }>
      subtotalEth: string
      discountEth: string
      totalEth: string
      couponCode: string | null
    }

    if (cart.items.length === 0) {
      return errorResponse(
        'EMPTY_CART',
        'Seu carrinho está vazio.',
        400
      )
    }

    // Verifica se os NFTs pertencem à rede selecionada
    const incompatibleItem = cart.items.find(
      (item) => item.nft.network !== input.network
    )

    if (incompatibleItem) {
      return errorResponse(
        'NETWORK_MISMATCH',
        'Todos os NFTs do pedido precisam pertencer à rede selecionada.',
        400
      )
    }

    // Valida disponibilidade no momento da compra
    for (const item of cart.items) {
      const nft = initialNFTs.find(
  (candidate) => candidate.id === item.nftId
)

      if (
        !nft ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > nft.availableQuantity
      ) {
        return errorResponse(
          'OUT_OF_STOCK',
          'Um dos NFTs não possui estoque suficiente.',
          409
        )
      }
    }

    const now = new Date().toISOString()

    const order: Order = {
      id: generateOrderId(),
      status: 'confirmed',
      items: cart.items as Order['items'],
      walletProvider: input.walletProvider,
      walletAddress: input.walletAddress.trim(),
      network: input.network,
      subtotalEth: cart.subtotalEth,
      discountEth: cart.discountEth,
      totalEth: cart.totalEth,
      couponCode: cart.couponCode,
      createdAt: now,
      updatedAt: now,
    }

    saveOrder(
      sessionId,
      input.idempotencyKey,
      order
    )

    return HttpResponse.json(order, {
      status: 201,
    })
  }),

  // Consultar pedido
  http.get('/api/orders/:orderId', ({ params }) => {
    const orderId = String(params.orderId)
    const order = findOrder(orderId)

    if (!order) {
      return errorResponse(
        'ORDER_NOT_FOUND',
        'Pedido não encontrado.',
        404
      )
    }

    return HttpResponse.json(order)
  }),
]
