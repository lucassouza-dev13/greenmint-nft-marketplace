
import { Link } from '@tanstack/react-router'
import { Package, UserRound, Wallet } from 'lucide-react'
import { useCurrentUser } from '../../auth/hooks/useAuth'
import { useOrderHistory } from '../../checkout/hooks/useOrderHistory'

export function AccountPage() {
  const { data: user, isPending: loadingUser } = useCurrentUser()
  const {
    data: orders = [],
    isPending: loadingOrders,
    isError,
    refetch,
  } = useOrderHistory()

  if (loadingUser) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-white">
        Carregando sua conta...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-white">
        <h1 className="mb-4 text-3xl font-bold">Minha conta</h1>
        <p className="mb-6 text-zinc-400">
          Entre na sua conta para visualizar seu perfil e suas compras.
        </p>
        <Link to="/login" className="text-orange-400 hover:underline">
          Fazer login
        </Link>
      </div>
    )
  }

  const purchasedNFTs = orders
    .filter((order) => order.status === 'confirmed')
    .reduce(
      (total, order) =>
        total +
        order.items.reduce(
          (quantity, item) => quantity + item.quantity,
          0
        ),
      0
    )

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 text-white">
      <div className="mb-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
          Área do colecionador
        </p>
        <h1 className="text-4xl font-bold">Minha conta</h1>
        <p className="mt-3 text-zinc-400">
          Gerencie seu perfil e acompanhe suas aquisições digitais.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-orange-500/10 p-4 text-orange-400">
            <UserRound size={28} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold">{user.name}</h2>
            <p className="break-all text-sm text-zinc-400">{user.email}</p>
          </div>
        </div>
      </section>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-4 flex items-center gap-3 text-zinc-400">
            <Package size={20} />
            <span>Pedidos realizados</span>
          </div>
          <p className="text-4xl font-bold">
            {loadingOrders ? '—' : orders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-4 flex items-center gap-3 text-zinc-400">
            <Wallet size={20} />
            <span>NFTs adquiridos</span>
          </div>
          <p className="text-4xl font-bold">
            {loadingOrders ? '—' : purchasedNFTs}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Histórico de compras</h2>

        {loadingOrders ? (
          <p className="text-zinc-400">Carregando seus pedidos...</p>
        ) : isError ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-6">
            <p className="mb-4 text-red-300">
              Não foi possível carregar seus pedidos.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-semibold text-orange-400 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
            <Package className="mx-auto mb-4 text-zinc-500" size={36} />
            <p className="mb-2 text-lg font-semibold">
              Você ainda não realizou nenhuma compra.
            </p>
            <p className="mb-5 text-zinc-400">
              Explore o catálogo e encontre seu primeiro NFT.
            </p>
            <Link to="/" className="font-semibold text-orange-400 hover:underline">
              Explorar NFTs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="mb-2 break-all text-sm text-zinc-400">
                      Pedido {order.id}
                    </p>
                    <p className="font-semibold">
                      {order.totalEth} ETH
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      {' · '}
                      {order.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}{' '}
                      NFT(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={
                        order.status === 'confirmed'
                          ? 'text-sm font-semibold text-green-400'
                          : 'text-sm font-semibold text-yellow-400'
                      }
                    >
                      {order.status === 'confirmed'
                        ? 'Confirmado'
                        : order.status === 'pending'
                          ? 'Pendente'
                          : 'Falhou'}
                    </span>

                    <Link
                      to="/pedido/$orderId"
                      params={{ orderId: order.id }}
                      className="shrink-0 font-semibold text-orange-400 hover:underline"
                    >
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
