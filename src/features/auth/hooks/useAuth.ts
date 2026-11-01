
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { authService } from '../../../services/authService'
import { AUTH_TOKEN_KEY } from '../../../lib/api'

const AUTH_TOKEN_QUERY_KEY = ['auth', 'token'] as const

function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function useAuthToken() {
  return useQuery({
    queryKey: AUTH_TOKEN_QUERY_KEY,
    queryFn: getStoredToken,
    initialData: getStoredToken,
    staleTime: Infinity,
  })
}

export function useCurrentUser() {
  const { data: token } = useAuthToken()

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
    onSuccess: ({ token, user }) => {
      localStorage.setItem(AUTH_TOKEN_KEY, token)

      // Remove os dados da sessão anterior.
      queryClient.removeQueries({
        queryKey: ['auth', 'me'],
      })

      queryClient.removeQueries({
        queryKey: ['cart'],
      })

      queryClient.removeQueries({
        queryKey: ['order'],
      })

      // Atualiza imediatamente o usuário conectado.
      queryClient.setQueryData(AUTH_TOKEN_QUERY_KEY, token)
      queryClient.setQueryData(['auth', 'me', token], user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: ({ token, user }) => {
      localStorage.setItem(AUTH_TOKEN_KEY, token)

      // Remove os dados da sessão anterior.
      queryClient.removeQueries({
        queryKey: ['auth', 'me'],
      })

      queryClient.removeQueries({
        queryKey: ['cart'],
      })

      queryClient.removeQueries({
        queryKey: ['order'],
      })

      // Atualiza imediatamente o usuário conectado.
      queryClient.setQueryData(AUTH_TOKEN_QUERY_KEY, token)
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

      queryClient.removeQueries({
        queryKey: ['auth', 'me'],
      })

      queryClient.removeQueries({
        queryKey: ['cart'],
      })

      queryClient.removeQueries({
        queryKey: ['order'],
      })

      queryClient.setQueryData(AUTH_TOKEN_QUERY_KEY, null)
    },
  })
}
