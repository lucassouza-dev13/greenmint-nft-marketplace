
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { UserPlus, Mail, LockKeyhole, UserRound } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    try {
      await register.mutateAsync({ name, email, password })
      await navigate({ to: '/' })
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message ??
            'Não foi possível criar sua conta.'
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
          <UserPlus className="text-[#e49a55]" size={28} />
        </div>

        <h1 className="text-center text-4xl font-bold text-[#f5f0e8]">
          Crie sua conta
        </h1>

        <p className="mt-3 text-center text-[#b9a89b]">
          Comece sua jornada como colecionador de NFTs.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[#49352b] bg-[#211713] p-7"
      >
        <div>
          <label
            htmlFor="register-name"
            className="mb-2 flex items-center gap-2 text-sm text-[#b9a89b]"
          >
            <UserRound size={16} />
            Nome
          </label>

          <input
            id="register-name"
            type="text"
            required
            minLength={2}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-2 flex items-center gap-2 text-sm text-[#b9a89b]"
          >
            <Mail size={16} />
            E-mail
          </label>

          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
          />
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-2 flex items-center gap-2 text-sm text-[#b9a89b]"
          >
            <LockKeyhole size={16} />
            Senha
          </label>

          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
          />
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
          disabled={register.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e49a55] px-5 py-3 font-bold text-[#120d0a] transition hover:bg-[#f1b579] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={18} />
          {register.isPending ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className="text-center text-sm text-[#b9a89b]">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#e49a55] hover:underline"
          >
            Entrar
          </Link>
        </p>
      </form>
    </section>
  )
}
