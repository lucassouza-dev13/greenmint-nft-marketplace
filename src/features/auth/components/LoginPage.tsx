
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await login.mutateAsync({ email, password })
      await navigate({ to: '/' })
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message ??
            'Não foi possível realizar o login.'
        )
      } else {
        setErrorMessage('Ocorreu um erro inesperado.')
      }
    }
  }

  return (
    <section className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e49a55]/10">
          <LockKeyhole className="text-[#e49a55]" size={28} />
        </div>

        <h1 className="text-4xl font-bold text-[#f5f0e8]">
          Bem-vindo de volta
        </h1>

        <p className="mt-3 text-[#b9a89b]">
          Entre para gerenciar sua carteira, coleção e perfil de criador.
        </p>
      </div>

      <div className="rounded-2xl border border-[#49352b] bg-[#211713] p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 flex items-center gap-2 text-sm text-[#b9a89b]"
            >
              <Mail size={16} />
              E-mail
            </label>

            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="contato@email.com"
              className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 flex items-center gap-2 text-sm text-[#b9a89b]"
            >
              <LockKeyhole size={16} />
              Senha
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 pr-12 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-3 flex items-center text-[#b9a89b] transition hover:text-[#e49a55]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-lg bg-[#e49a55] px-5 py-3 font-bold text-[#120d0a] transition hover:bg-[#f1b579] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#49352b]" />
          <span className="text-sm text-[#b9a89b]">
            Ou continue com
          </span>
          <div className="h-px flex-1 bg-[#49352b]" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            disabled
            title="Login com Google indisponível nesta demonstração"
            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#b9a89b] opacity-70"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.24c0-.73-.06-1.26-.2-1.82H12v3.61h5.37a4.6 4.6 0 0 1-1.99 3.02v2.48h3.2c1.87-1.72 2.77-4.25 2.77-7.29Z"
              />
              <path
                fill="#34A853"
                d="M12 21.75c2.67 0 4.91-.88 6.55-2.39l-3.2-2.48c-.89.6-2.03.96-3.35.96-2.57 0-4.75-1.74-5.53-4.08H3.17v2.55A9.9 9.9 0 0 0 12 21.75Z"
              />
              <path
                fill="#FBBC05"
                d="M6.47 13.76A5.95 5.95 0 0 1 6.16 12c0-.61.11-1.2.3-1.76V7.69H3.18A9.9 9.9 0 0 0 2.12 12c0 1.6.38 3.11 1.05 4.31l3.3-2.55Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.16c1.45 0 2.75.5 3.77 1.48l2.83-2.83A9.58 9.58 0 0 0 12 2.25a9.9 9.9 0 0 0-8.83 5.44l3.3 2.55C7.25 7.9 9.43 6.16 12 6.16Z"
              />
            </svg>
            Continuar com Google
          </button>

          <button
            type="button"
            disabled
            title="Login com Facebook indisponível nesta demonstração"
            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#b9a89b] opacity-70"
          >
            <span
              aria-hidden="true"
              className="text-2xl font-extrabold leading-none text-[#1877F2]"
            >
              f
            </span>
            Continuar com Facebook
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-[#8f7c70]">
          Login social indisponível nesta demonstração.
        </p>

        <p className="mt-7 text-center text-sm text-[#b9a89b]">
          Ainda não tem uma conta?{' '}
          <Link
            to="/cadastro"
            className="font-semibold text-[#e49a55] hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </section>
  )
}
