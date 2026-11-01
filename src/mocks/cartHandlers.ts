
import { http, HttpResponse } from 'msw'
import { initialNFTs } from './fixtures/nfts'
import type { Cart, CartItem } from '../types/cart'
import { getCartOwnerId } from './authIdentity'

type StoredItem = {
  nftId: string
  quantity: number
}

type StoredCart = {
  items: StoredItem[]
  couponCode: string | null
}

const STORAGE_KEY = 'greenmint_mock_carts_v1'

const carts = new Map<string, StoredItem[]>()
const coupons = new Map<string, string>()

const COUPON_DISCOUNTS: Record<string, bigint> = {
  GREEN10: 10n,
  WELCOME5: 5n,
}

const ETH_DECIMALS = 18n
const WEI_PER_ETH = 10n ** ETH_DECIMALS

// Carrega os carrinhos salvos no navegador
function loadStoredCarts(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) return

    const parsed: unknown = JSON.parse(saved)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return
    }

    for (const [sessionId, value] of Object.entries(parsed)) {
      if (
        typeof value !== 'object' ||
        value === null ||
        !('items' in value) ||
        !Array.isArray(value.items)
      ) {
        continue
      }

      const items: StoredItem[] = []

      for (const item of value.items) {
        if (
          typeof item === 'object' &&
          item !== null &&
          typeof item.nftId === 'string' &&
          Number.isSafeInteger(item.quantity) &&
          item.quantity > 0
        ) {
          items.push({
            nftId: item.nftId,
            quantity: item.quantity,
          })
        }
      }

      carts.set(sessionId, items)

      if (
        'couponCode' in value &&
        typeof value.couponCode === 'string' &&
        Object.prototype.hasOwnProperty.call(
          COUPON_DISCOUNTS,
          value.couponCode
        )
      ) {
        coupons.set(sessionId, value.couponCode)
      }
    }
  } catch {
    // Se o armazenamento estiver indisponível,
    // a API continua funcionando em memória.
  }
}

// Salva os carrinhos após cada alteração
function saveStoredCarts(): void {
  try {
    const data: Record<string, StoredCart> = {}

    for (const [sessionId, items] of carts) {
      data[sessionId] = {
        items,
        couponCode: coupons.get(sessionId) ?? null,
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Falhas de armazenamento não interrompem a API.
  }
}

loadStoredCarts()

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
  return getCartOwnerId(request)
}

function getStoredItems(sessionId: string): StoredItem[] {
  return carts.get(sessionId) ?? []
}

export function clearCartAfterOrder(sessionId: string): void {
  carts.delete(sessionId)
  coupons.delete(sessionId)
  saveStoredCarts()
}

export function buildCart(sessionId: string): Cart {
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
      total +
      toWei(item.nft.priceEth) * BigInt(item.quantity),
    0n
  )

  const couponCode = coupons.get(sessionId) ?? null

  const discountPercent = couponCode
    ? (COUPON_DISCOUNTS[couponCode] ?? 0n)
    : 0n

  const discountWei =
    (subtotalWei * discountPercent) / 100n

  const totalWei = subtotalWei - discountWei

  return {
    items,
    subtotalEth: fromWei(subtotalWei),
    discountEth: fromWei(discountWei),
    totalEth: fromWei(totalWei),
    couponCode,
  }
}

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

    const body = (await request.json()) as {
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

    const storedItems = [...getStoredItems(sessionId)]

    const existing = storedItems.find(
      (item) => item.nftId === nft.id
    )

    const currentQuantity = existing?.quantity ?? 0

    if (
      currentQuantity + quantity >
      nft.availableQuantity
    ) {
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
    saveStoredCarts()

    return HttpResponse.json(buildCart(sessionId))
  }),

  // Atualizar quantidade
  http.patch('/api/cart/items/:nftId', async ({
    request,
    params,
  }) => {
    const sessionId = getSessionId(request)
    const nftId = String(params.nftId)

    const body = (await request.json()) as {
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
    saveStoredCarts()

    return HttpResponse.json(buildCart(sessionId))
  }),

  // Remover NFT
  http.delete('/api/cart/items/:nftId', ({
    request,
    params,
  }) => {
    const sessionId = getSessionId(request)
    const nftId = String(params.nftId)

    const remainingItems = getStoredItems(
      sessionId
    ).filter((item) => item.nftId !== nftId)

    carts.set(sessionId, remainingItems)

    if (remainingItems.length === 0) {
      coupons.delete(sessionId)
    }

    saveStoredCarts()

    return HttpResponse.json(buildCart(sessionId))
  }),

  // Aplicar cupom
  http.post('/api/cart/coupon', async ({ request }) => {
    const sessionId = getSessionId(request)

    const body = (await request.json()) as {
      code?: string
    }

    const code =
      typeof body.code === 'string'
        ? body.code.trim().toUpperCase()
        : ''

    if (
      !Object.prototype.hasOwnProperty.call(
        COUPON_DISCOUNTS,
        code
      )
    ) {
      return errorResponse(
        'INVALID_COUPON',
        'Cupom inválido ou expirado.',
        400
      )
    }

    if (getStoredItems(sessionId).length === 0) {
      return errorResponse(
        'EMPTY_CART',
        'Adicione um NFT antes de aplicar um cupom.',
        400
      )
    }

    coupons.set(sessionId, code)
    saveStoredCarts()

    return HttpResponse.json(buildCart(sessionId))
  }),

  // Remover cupom
  http.delete('/api/cart/coupon', ({ request }) => {
    const sessionId = getSessionId(request)

    coupons.delete(sessionId)
    saveStoredCarts()

    return HttpResponse.json(buildCart(sessionId))
  }),
]
