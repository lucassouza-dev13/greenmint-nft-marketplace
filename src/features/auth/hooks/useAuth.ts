
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../../../services/authService'
import { AUTH_TOKEN_KEY } from '../../../lib/api'

export function useCurrentUser() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)

  return useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: authService.me,
    enabled: Boolean(token),
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async ({ token, user }) => {
      localStorage.setItem(AUTH_TOKEN_KEY, token)

      queryClient.removeQueries({ queryKey: ['auth'] })

      queryClient.setQueryData(['auth', 'me', token], user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: async ({ token, user }) => {
      localStorage.setItem(AUTH_TOKEN_KEY, token)

      queryClient.removeQueries({ queryKey: ['auth'] })

      queryClient.setQueryData(['auth', 'me', token], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}
