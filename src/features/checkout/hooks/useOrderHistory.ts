
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../../../services/orderService'
import { useAuthToken } from '../../auth/hooks/useAuth'

export function useOrderHistory() {
  const { data: token } = useAuthToken()

  return useQuery({
    queryKey: ['order', 'history', token],
    queryFn: orderService.getAll,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  })
}
