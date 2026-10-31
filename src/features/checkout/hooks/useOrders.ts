
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { orderService } from '../../../services/orderService'

import type {
  CreateOrderInput,
} from '../../../types/order'

// Criar um pedido
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      orderService.createOrder(input),

    onSuccess: (order) => {
      // Guarda o pedido retornado pela API
      queryClient.setQueryData(
        ['order', order.id],
        order
      )

      // Atualiza o carrinho após a compra
      queryClient.invalidateQueries({
        queryKey: ['cart'],
      })

      // Atualiza o catálogo caso haja alteração de estoque
      queryClient.invalidateQueries({
        queryKey: ['nfts'],
      })
    },
  })
}

// Consultar um pedido existente
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: Boolean(orderId),
    staleTime: 10_000,
  })
}
