
import { http, HttpResponse } from 'msw'
import { initialNFTs } from './fixtures/nfts'
import type { Cart, CartItem } from '../types/cart'

type StoredItem = {
  nftId: string
  quantity: number
}

// Armazenamento temporário do mock.
// Cada sessão identificada possui seu próprio carrinho.
const carts = new Map<string, StoredItem[]>()

const ETH_DECIMALS = 18n
const WEI_PER_ETH = 10n ** ETH_DECIMALS

function toWei(eth: string): bigint {
  const [whole, fraction = ''] = eth.split('.')

  if (
    !/^\d+$/.test(whole) ||
    !/^\d*$/.test(fraction) ||
    fraction.length > 18
  ) {
    throw new Error('Preço ETH inválido')
  }

  return (
    BigInt(whole) * WEI_PER_ETH +
    BigInt(fraction.padEnd(18, '0'))
  )
}

function fromWei(wei: bigint): string {
  const whole = wei / WEI_PER_ETH
  const fraction = (wei % WEI_PER_ETH)
    .toString()
    .padStart(18, '0')
    .replace(/0+$/, '')

  return fraction ? `${whole}.${fraction}` : `${whole}`
}

function getSessionId(request: Request): string {
  return request.headers.get('x-session-id') ?? 'guest'
}

function getStoredItems(sessionId: string): StoredItem[] {
  return carts.get(sessionId) ?? []
}

function buildCart(sessionId: string): Cart {
  const storedItems = getStoredItems(sessionId)

  const items: CartItem[] = storedItems.flatMap((item) => {
    const nft = initialNFTs.find(
      (candidate) => candidate.id === item.nftId
    )

    if (!nft) return []

    return [{
      nftId: nft.id,
      quantity: item.quantity,
      nft: {
        id: nft.id,
        name: nft.name,
        imageUrl: nft.imageUrl,
        priceEth: nft.priceEth,
        network: nft.network,
        availableQuantity: nft.availableQuantity,
      },
    }]
  })

  const subtotalWei = items.reduce(
    (total, item) =>
      total + toWei(item.nft.priceEth) * BigInt(item.quantity),
    0n
  )

  return {
    items,
    subtotalEth: fromWei(subtotalWei),
    discountEth: '0',
    totalEth: fromWei(subtotalWei),
    couponCode: null,
  }
}

function errorResponse(
  code: string,
  message: string,
  status: number
) {
  return HttpResponse.json({ code, message }, { status })
}

export const cartHandlers = [
  // Consultar carrinho
  http.get('/api/cart', ({ request }) => {
    return HttpResponse.json(
      buildCart(getSessionId(request))
    )
  }),

  // Adicionar NFT
  http.post('/api/cart/items', async ({ request }) => {
    const sessionId = getSessionId(request)
    const body = await request.json() as {
      nftId?: string
      quantity?: number
    }

    const nft = initialNFTs.find(
      (item) => item.id === body.nftId
    )

    if (!nft) {
      return errorResponse(
        'NFT_NOT_FOUND',
        'NFT não encontrado.',
        404
      )
    }

    const quantity = body.quantity

    if (
      !Number.isSafeInteger(quantity) ||
      quantity === undefined ||
      quantity < 1
    ) {
      return errorResponse(
        'INVALID_QUANTITY',
        'Quantidade inválida.',
        400
      )
    }

    const storedItems = [...getStoredItems(sessionId)]
    const existing = storedItems.find(
      (item) => item.nftId === nft.id
    )

    const currentQuantity = existing?.quantity ?? 0

    if (currentQuantity + quantity > nft.availableQuantity) {
      return errorResponse(
        'INSUFFICIENT_STOCK',
        'Quantidade indisponível em estoque.',
        409
      )
    }

    if (existing) {
      existing.quantity += quantity
    } else {
      storedItems.push({
        nftId: nft.id,
        quantity,
      })
    }

    carts.set(sessionId, storedItems)

    return HttpResponse.json(buildCart(sessionId))
  }),

  // Atualizar quantidade
  http.patch('/api/cart/items/:nftId', async ({
    request,
    params,
  }) => {
    const sessionId = getSessionId(request)
    const nftId = String(params.nftId)
    const body = await request.json() as {
      quantity?: number
    }

    const nft = initialNFTs.find(
      (item) => item.id === nftId
    )

    if (!nft) {
      return errorResponse(
        'NFT_NOT_FOUND',
        'NFT não encontrado.',
        404
      )
    }

    const quantity = body.quantity

    if (
      quantity === undefined ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {
      return errorResponse(
        'INVALID_QUANTITY',
        'Quantidade inválida.',
        400
      )
    }

    if (quantity > nft.availableQuantity) {
      return errorResponse(
        'INSUFFICIENT_STOCK',
        'Quantidade indisponível em estoque.',
        409
      )
    }

    const storedItems = [...getStoredItems(sessionId)]
    const existing = storedItems.find(
      (item) => item.nftId === nftId
    )

    if (!existing) {
      return errorResponse(
        'ITEM_NOT_FOUND',
        'Item não está no carrinho.',
        404
      )
    }

    existing.quantity = quantity
    carts.set(sessionId, storedItems)

    return HttpResponse.json(buildCart(sessionId))
  }),

  // Remover NFT
  http.delete('/api/cart/items/:nftId', ({
    request,
    params,
  }) => {
    const sessionId = getSessionId(request)
    const nftId = String(params.nftId)

    const storedItems = getStoredItems(sessionId)

    carts.set(
      sessionId,
      storedItems.filter((item) => item.nftId !== nftId)
    )

    return HttpResponse.json(buildCart(sessionId))
  }),
]
