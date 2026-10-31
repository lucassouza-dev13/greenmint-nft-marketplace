
import { useQuery } from '@tanstack/react-query'
import { nftService } from '../../../services/nftService'

export function useNFTDetail(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: () => nftService.getById(id),
    enabled: Boolean(id),
    retry: 1,
  })
}
