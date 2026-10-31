
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { cartService } from '../../../services/cartService'

import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from '../../../types/cart'

const CART_QUERY_KEY = ['cart'] as const

// Consultar carrinho
export function useCart() {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: cartService.getCart,
    staleTime: 10_000,
  })
}

// Adicionar NFT
export function useAddCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddCartItemInput) =>
      cartService.addItem(input),

    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart)
    },
  })
}

// Atualizar quantidade
export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCartItemInput) =>
      cartService.updateItem(input),

    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart)
    },
  })
}

// Remover NFT
export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nftId: string) =>
      cartService.removeItem(nftId),

    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart)
    },
  })
}

// Aplicar cupom
export function useApplyCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) =>
      cartService.applyCoupon(code),

    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart)
    },
  })
}

// Remover cupom
export function useRemoveCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      cartService.removeCoupon(),

    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart)
    },
  })
}
