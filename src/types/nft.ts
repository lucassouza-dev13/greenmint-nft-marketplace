
export interface NFT {
  id: string
  name: string
  collection: string
  creator: string
  description: string
  imageUrl: string
  priceEth: string
  network: 'ethereum' | 'polygon' | 'solana'
  edition: number
  totalEditions: number
  availableQuantity: number
  featured: boolean
  version: number
}

export interface NFTListParams {
  search?: string
  collection?: string
  network?: NFT['network']
  sort?: 'newest' | 'price_asc' | 'price_desc'
  page?: number
  limit?: number
}

export interface NFTListResponse {
  items: NFT[]
  page: number
  limit: number
  total: number
  totalPages: number
}
