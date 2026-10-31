
import { http, HttpResponse } from 'msw'
import { initialNFTs } from './fixtures/nfts'
import { cartHandlers } from './cartHandlers'
import type { NFT, NFTListResponse } from '../types/nft'
import { orderHandlers } from './orderHandlers'

const PAGE_SIZE = 6

function getFilteredNFTs(url: URL): NFTListResponse {
  const search =
    url.searchParams.get('search')?.trim().toLowerCase() ?? ''

  const collection = url.searchParams.get('collection') ?? ''
  const network = url.searchParams.get('network') ?? ''
  const sort = url.searchParams.get('sort') ?? 'newest'

  const requestedPage = Number(
    url.searchParams.get('page') ?? 1
  )

  const requestedLimit = Number(
    url.searchParams.get('limit') ?? PAGE_SIZE
  )

  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1

  const limit =
    Number.isSafeInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : PAGE_SIZE

  let results: NFT[] = initialNFTs.filter((nft) => {
    const matchesSearch =
      nft.name.toLowerCase().includes(search) ||
      nft.creator.toLowerCase().includes(search)

    const matchesCollection =
      !collection || nft.collection === collection

    const matchesNetwork =
      !network || nft.network === network

    return (
      matchesSearch &&
      matchesCollection &&
      matchesNetwork
    )
  })

  results = [...results].sort((a, b) => {
    if (sort === 'price_asc') {
      return Number(a.priceEth) - Number(b.priceEth)
    }

    if (sort === 'price_desc') {
      return Number(b.priceEth) - Number(a.priceEth)
    }

    return Number(b.id) - Number(a.id)
  })

  const total = results.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit

  return {
    items: results.slice(start, start + limit),
    page,
    limit,
    total,
    totalPages,
  }
}

export const handlers = [
  // Verificação da API
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      service: 'GreenMint Mock API',
    })
  }),

  // Listagem, busca, filtros e paginação
  http.get('/api/nfts', ({ request }) => {
    console.log('MSW recebeu:', request.url)

    const url = new URL(request.url)
    const response = getFilteredNFTs(url)

    return HttpResponse.json(response)
  }),

  // Detalhes de um NFT
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = initialNFTs.find(
      (item) => item.id === params.id
    )

    if (!nft) {
      return HttpResponse.json(
        {
          code: 'NFT_NOT_FOUND',
          message: 'NFT não encontrado.',
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(nft)
  }),

   // Endpoints do carrinho
  ...cartHandlers,

  // Endpoints dos pedidos
  ...orderHandlers,
]