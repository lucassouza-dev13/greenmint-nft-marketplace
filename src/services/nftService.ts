
import { api } from '../lib/api'
import type {
  NFT,
  NFTListParams,
  NFTListResponse,
} from '../types/nft'

export const nftService = {
  async getAll(params: NFTListParams = {}): Promise<NFTListResponse> {
    const response = await api.get<NFTListResponse>('/nfts', {
      params,
    })

    return response.data
  },

  async getById(id: string): Promise<NFT> {
    const response = await api.get<NFT>(
      `/nfts/${encodeURIComponent(id)}`
    )

    return response.data
  },
}
