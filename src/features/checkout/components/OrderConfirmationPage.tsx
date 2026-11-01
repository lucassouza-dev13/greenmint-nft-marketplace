
import { Link, useParams } from '@tanstack/react-router'
import {
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  Wallet,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react'

import { useOrder } from '../hooks/useOrders'

export default function OrderConfirmationPage() {
  const { orderId } = useParams({
    from: '/pedido/$orderId',
  })

  const { data: order, isLoading, isError } = useOrder(orderId)

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center px-6">
        <div className="flex items-center gap-3 text-white/70">
          <LoaderCircle className="h-6 w-6 animate-spin text-orange-400" />
          Carregando seu pedido...
        </div>
      </section>
    )
  }

  if (isError || !order) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-5xl flex-col items-center justify-center gap-5 px-6 text-center">
        <AlertCircle className="h-12 w-12 text-orange-400" />

        <h1 className="text-2xl font-bold text-white">
          Não foi possível encontrar este pedido
        </h1>

        <p className="max-w-md text-white/60">
          Verifique o endereço ou tente acessar novamente.
        </p>

        <Link
          to="/"
          className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
        >
          Voltar ao catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto min-h-[80vh] max-w-5xl px-5 py-12 md:px-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          Compra confirmada!
        </h1>

        <p className="text-white/60">
          Seu pedido foi registrado com sucesso no GreenMint.
        </p>

        <p className="mt-4 text-sm text-orange-400">
          Pedido #{order.id}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-orange-400" />

            <h2 className="text-xl font-semibold text-white">
              NFTs adquiridos
            </h2>
          </div>

          <div className="space-y-5">
            {order.items.map((item) => (
              <div
                key={item.nftId}
                className="flex items-center gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"
              >
                <img
                  src={item.nft.imageUrl}
                  alt={item.nft.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">
                    {item.nft.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/50">
                    Quantidade: {item.quantity}
                  </p>

                  <p className="mt-1 text-sm text-orange-400">
                    {item.nft.priceEth} ETH por unidade
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-semibold text-white">
              Resumo do pagamento
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{order.subtotalEth} ETH</span>
              </div>

              {order.couponCode && (
                <div className="flex justify-between text-green-400">
                  <span>Desconto ({order.couponCode})</span>
                  <span>-{order.discountEth} ETH</span>
                </div>
              )}

              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-orange-400">
                  {order.totalEth} ETH
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Wallet className="h-5 w-5 text-orange-400" />

              <h2 className="text-xl font-semibold text-white">
                Carteira utilizada
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-white/60">
                Provedor:{' '}
                <span className="text-white">
                  {order.walletProvider}
                </span>
              </p>

              <p className="text-white/60">
                Rede:{' '}
                <span className="text-white">
                  {order.network}
                </span>
              </p>

              <p className="break-all text-white/60">
                Endereço:{' '}
                <span className="text-white">
                  {order.walletAddress}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao catálogo
        </Link>
      </div>
    </section>
  )
}
