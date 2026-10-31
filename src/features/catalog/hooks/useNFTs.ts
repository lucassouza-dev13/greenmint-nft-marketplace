
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { nftService } from '../../../services/nftService'
import type { NFTListParams } from '../../../types/nft'

export function useNFTs(params: NFTListParams = {}) {
  return useQuery({
    queryKey: ['nfts', params],
    queryFn: () => nftService.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

