
import { Link } from '@tanstack/react-router'
import { Menu, ShoppingCart, UserRound } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

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
            to="/login"
            className="text-sm text-[#f5f0e8] hover:text-[#e49a55]"
          >
            Minha conta
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/carrinho"
            aria-label="Abrir carrinho"
            className="rounded-lg p-2 text-[#f5f0e8] hover:bg-[#30221c]"
          >
            <ShoppingCart size={22} />
          </Link>

          <Link
            to="/login"
            aria-label="Entrar na conta"
            className="hidden rounded-lg p-2 text-[#f5f0e8] hover:bg-[#30221c] sm:inline-flex"
          >
            <UserRound size={22} />
          </Link>

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
            className="rounded-lg px-3 py-2 hover:bg-[#30221c]"
          >
            Explorar NFTs
          </Link>

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2 hover:bg-[#30221c]"
          >
            Minha conta
          </Link>
        </nav>
      )}
    </header>
  )
}
