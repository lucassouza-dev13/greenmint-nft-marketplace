
import { http, HttpResponse } from 'msw'

import { initialNFTs } from './fixtures/nfts'
import { saveNFTStock } from './nftStore'
import { getCartOwnerId } from './authIdentity'
import {
  buildCart,
  clearCartAfterOrder,
} from './cartHandlers'

import {
  findOrder,
  findOrderByIdempotencyKey,
  generateOrderId,
  isOrderOwner,
  saveOrder,
} from './orderStore'


import type {
  CreateOrderInput,
  Order,
  PaymentNetwork,
  WalletProvider,
} from '../types/order'

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

// Relaciona os pedidos às sessões que os criaram.
// Nesta etapa, os dados ainda são temporários.

function getSessionId(request: Request): string {
  return getCartOwnerId(request)
}

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
    const sessionId = getSessionId(request)

    let input: Partial<CreateOrderInput>

    try {
      input = (await request.json()) as Partial<CreateOrderInput>
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

    // Evita pedidos duplicados.
    // Essa verificação acontece antes de consultar o carrinho,
    // pois ele será limpo após a primeira compra.
    const existingOrder = findOrderByIdempotencyKey(
      sessionId,
      input.idempotencyKey
    )

    if (existingOrder) {
      return HttpResponse.json(existingOrder)
    }

   // Consulta diretamente o carrinho da API simulada.
    const cart = buildCart(sessionId)

    // Todos os NFTs devem pertencer à rede selecionada.
    const incompatibleItem = cart.items.find(
      (item) => item.nft.network !== input.network
    )

    if (incompatibleItem) {
      return errorResponse(
        'NETWORK_MISMATCH',
        'Todos os NFTs precisam pertencer à rede selecionada.',
        400
      )
    }

    // Verifica disponibilidade antes de criar o pedido.
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
      items: cart.items.map((item) => ({
        ...item,
        nft: { ...item.nft },
      })),
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

    // Registra o pedido e sua chave de idempotência.
    saveOrder(
      sessionId,
      input.idempotencyKey,
      order
    )


    
    // Atualiza o estoque dos NFTs adquiridos.
    for (const item of cart.items) {
      const nft = initialNFTs.find(
        (candidate) => candidate.id === item.nftId
      )

      if (nft) {
        nft.availableQuantity -= item.quantity
        nft.version += 1
      }
    }

    // Persiste o estoque atualizado no navegador.
    saveNFTStock()

    // Limpa o carrinho somente após registrar o pedido.
    clearCartAfterOrder(sessionId)


    return HttpResponse.json(order, {
      status: 201,
    })
  }),

  // Consultar pedido
  http.get('/api/orders/:orderId', ({ request, params }) => {
    const sessionId = getSessionId(request)
    const orderId = String(params.orderId)

    const order = findOrder(orderId)

    if (!order) {
      return errorResponse(
        'ORDER_NOT_FOUND',
        'Pedido não encontrado.',
        404
      )
    }

    if (!isOrderOwner(orderId, sessionId)) {
      return errorResponse(
        'ORDER_NOT_FOUND',
        'Pedido não encontrado.',
        404
      )
    }

    return HttpResponse.json(order)
  }),
]
