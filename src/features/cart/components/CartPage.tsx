
import { Link } from '@tanstack/react-router'
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '../hooks/useCart'

export function CartPage() {
  const { data: cart, isPending, isError, refetch } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const isUpdating = updateItem.isPending || removeItem.isPending

  if (isPending) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center text-[#b9a89b]">
        Carregando carrinho...
      </div>
    )
  }

  if (isError || !cart) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#f5f0e8]">
          Não foi possível carregar o carrinho.
        </h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-5 rounded-lg bg-[#e49a55] px-6 py-3 font-semibold text-[#120d0a]"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-8">
      <Link
        to="/"
        className="text-sm text-[#e49a55] hover:underline"
      >
        ← Continuar explorando
      </Link>

      <h1 className="mt-6 text-4xl font-bold text-[#f5f0e8]">
        Meu carrinho
      </h1>

      <p className="mt-2 text-[#b9a89b]">
        Revise os NFTs selecionados antes de finalizar sua compra.
      </p>

      {cart.items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#49352b] bg-[#211713] p-12 text-center">
          <p className="text-xl font-semibold text-[#f5f0e8]">
            Seu carrinho está vazio.
          </p>
          <p className="mt-2 text-sm text-[#b9a89b]">
            Explore o catálogo e escolha seus NFTs favoritos.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-[#e49a55] px-6 py-3 font-semibold text-[#120d0a]"
          >
            Explorar NFTs
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article
                key={item.nftId}
                className="flex flex-col gap-5 rounded-xl border border-[#49352b] bg-[#211713] p-4 sm:flex-row"
              >
                <Link
                  to="/nft/$nftId"
                  params={{ nftId: item.nftId }}
                  className="shrink-0"
                >
                  <img
                    src={item.nft.imageUrl}
                    alt={item.nft.name}
                    className="h-36 w-full rounded-lg object-cover sm:w-36"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#f5f0e8]">
                      {item.nft.name}
                    </h2>

                    <p className="mt-1 text-sm capitalize text-[#b9a89b]">
                      {item.nft.network}
                    </p>

                    <p className="mt-3 font-bold text-[#e49a55]">
                      {item.nft.priceEth} ETH por unidade
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Diminuir quantidade de ${item.nft.name}`}
                        disabled={isUpdating || item.quantity <= 1}
                        onClick={() =>
                          updateItem.mutate({
                            nftId: item.nftId,
                            quantity: item.quantity - 1,
                          })
                        }
                        className="h-9 w-9 rounded-lg border border-[#49352b] text-[#f5f0e8] disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center text-[#f5f0e8]">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Aumentar quantidade de ${item.nft.name}`}
                        disabled={
                          isUpdating ||
                          item.quantity >= item.nft.availableQuantity
                        }
                        onClick={() =>
                          updateItem.mutate({
                            nftId: item.nftId,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="h-9 w-9 rounded-lg border border-[#49352b] text-[#f5f0e8] disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => removeItem.mutate(item.nftId)}
                      className="text-sm text-red-400 hover:underline disabled:opacity-40"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {(updateItem.isError || removeItem.isError) && (
              <p role="alert" className="text-sm text-red-400">
                Não foi possível atualizar o carrinho. Tente novamente.
              </p>
            )}
          </div>

          <aside className="h-fit rounded-xl border border-[#49352b] bg-[#211713] p-6">
            <h2 className="text-xl font-bold text-[#f5f0e8]">
              Resumo do pedido
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[#b9a89b]">Subtotal</span>
                <span className="text-[#f5f0e8]">
                  {cart.subtotalEth} ETH
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-[#b9a89b]">Desconto</span>
                <span className="text-[#f5f0e8]">
                  {cart.discountEth} ETH
                </span>
              </div>

              <div className="border-t border-[#49352b] pt-4">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-[#f5f0e8]">
                    Total
                  </span>
                  <span className="text-xl font-bold text-[#e49a55]">
                    {cart.totalEth} ETH
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-[#b9a89b]">
              O checkout será conectado na próxima etapa.
            </p>
          </aside>
        </div>
      )}
    </section>
  )
}
