
import { initialNFTs } from './fixtures/nfts'

const STORAGE_KEY = 'greenmint_mock_nft_stock_v1'

type StoredNFTStock = {
  availableQuantity: number
  version: number
}

type StoredStock = Record<string, StoredNFTStock>

let initialized = false

export function initializeNFTStock(): void {
  if (initialized) return

  initialized = true

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

    const stock = parsed as Record<string, unknown>

    for (const nft of initialNFTs) {
      const stored = stock[nft.id]

      if (
        typeof stored !== 'object' ||
        stored === null ||
        !('availableQuantity' in stored) ||
        !('version' in stored)
      ) {
        continue
      }

      const { availableQuantity, version } = stored

      if (
        Number.isSafeInteger(availableQuantity) &&
        Number(availableQuantity) >= 0 &&
        Number.isSafeInteger(version) &&
        Number(version) >= nft.version
      ) {
        nft.availableQuantity = Number(availableQuantity)
        nft.version = Number(version)
      }
    }
  } catch {
    console.warn(
      '[GreenMint] Não foi possível restaurar o estoque.'
    )
  }
}

export function saveNFTStock(): void {
  const stock: StoredStock = {}

  for (const nft of initialNFTs) {
    stock[nft.id] = {
      availableQuantity: nft.availableQuantity,
      version: nft.version,
    }
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stock)
    )
  } catch {
    console.warn(
      '[GreenMint] Não foi possível salvar o estoque.'
    )
  }
}

// Restaura o estoque quando o módulo é carregado.
initializeNFTStock()
