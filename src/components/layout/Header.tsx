
import { Link, useNavigate } from '@tanstack/react-router'
import {
  LogIn,
  LogOut,
  Menu,
  ShoppingCart,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import {
  useCurrentUser,
  useLogout,
} from '../../features/auth/hooks/useAuth'
import { useCart } from '../../features/cart/hooks/useCart'

export function Header() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentUser = useCurrentUser()
  const logout = useLogout()
  const cart = useCart()

  const user = currentUser.data
  const isAuthenticated = Boolean(user)

  const cartQuantity =
    cart.data?.items.reduce(
      (total, item) => total + item.quantity,
      0
    ) ?? 0

  async function handleLogout() {
    try {
      await logout.mutateAsync()
    } finally {
      setMenuOpen(false)
      await navigate({ to: '/login' })
    }
  }

  return (
    <header className="border-b border-[#49352b] bg-[#120d0a]">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-[#e49a55]"
        >
          GreenMint
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 md:flex"
        >
          <Link
            to="/"
            className="text-sm text-[#f5f0e8] hover:text-[#e49a55]"
          >
            Explorar NFTs
          </Link>

          <Link
            to={isAuthenticated ? '/minha-conta' : '/login'}
            className="text-sm text-[#f5f0e8] hover:text-[#e49a55]"
          >
            Minha conta
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/carrinho"
            aria-label={
              cartQuantity > 0
                ? `Abrir carrinho, ${cartQuantity} itens`
                : 'Abrir carrinho'
            }
            className="relative rounded-lg p-2 text-[#f5f0e8] hover:bg-[#30221c]"
          >
            <ShoppingCart size={22} />

            {cartQuantity > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e49a55] px-1 text-[11px] font-bold leading-none text-[#120d0a]"
              >
                {cartQuantity > 99 ? '99+' : cartQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/minha-conta"
                title="Minha conta"
                aria-label="Abrir minha conta"
                className="hidden text-sm text-[#e49a55] hover:underline lg:inline"
              >
                {user?.name}
              </Link>

              <button
                type="button"
                aria-label="Sair da conta"
                title="Sair da conta"
                disabled={logout.isPending}
                onClick={() => void handleLogout()}
                className="hidden rounded-lg p-2 text-[#f5f0e8] hover:bg-[#30221c] disabled:opacity-50 sm:inline-flex"
              >
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              aria-label="Entrar na conta"
              title="Entrar"
              className="hidden rounded-lg p-2 text-[#f5f0e8] hover:bg-[#30221c] sm:inline-flex"
            >
              <UserRound size={22} />
            </Link>
          )}

          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="greenmint-mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-[#f5f0e8] hover:bg-[#30221c] md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="greenmint-mobile-menu"
          aria-label="Navegação mobile"
          className="flex flex-col gap-2 border-t border-[#49352b] px-4 py-4 md:hidden"
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-[#f5f0e8] hover:bg-[#30221c]"
          >
            Explorar NFTs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/minha-conta"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#e49a55] hover:bg-[#30221c]"
              >
                <UserRound size={18} />
                Minha conta — {user?.name}
              </Link>

              <button
                type="button"
                disabled={logout.isPending}
                onClick={() => void handleLogout()}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[#f5f0e8] hover:bg-[#30221c] disabled:opacity-50"
              >
                <LogOut size={18} />
                Sair da conta
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#f5f0e8] hover:bg-[#30221c]"
            >
              <LogIn size={18} />
              Entrar na conta
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
