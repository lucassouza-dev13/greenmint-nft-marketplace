
import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useNFTDetail } from '../hooks/useNFTDetail'
import { useAddCartItem } from '../../cart/hooks/useCart'
import axios from 'axios'

export function NFTDetail() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { data: nft, isPending, isError, refetch } = useNFTDetail(nftId)

  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const addCartItem = useAddCartItem()
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState('')

async function handleAddToCart() {
  setCartMessage('')
  setCartError('')

  try {
    await addCartItem.mutateAsync({
      nftId,
      quantity: selectedQuantity,
    })

    setCartMessage('NFT adicionado ao carrinho com sucesso!')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      setCartError(
        error.response?.data?.message ??
          'Não foi possível adicionar o NFT ao carrinho.'
      )
    } else {
      setCartError('Ocorreu um erro inesperado.')
    }
  }
}

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center text-[#b9a89b]">
        Carregando detalhes do NFT...
      </div>
    )
  }

  if (isError || !nft) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#f5f0e8]">
          Não foi possível carregar este NFT.
        </h1>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 rounded-lg bg-[#e49a55] px-6 py-3 font-semibold text-[#120d0a]"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const available = nft.availableQuantity
  const maxQuantity = Math.max(1, available)
  const selectedQuantity = Math.min(quantity, maxQuantity)

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
      <Link
        to="/"
        className="mb-8 inline-flex text-sm text-[#e49a55] hover:underline"
      >
        ← Voltar para o catálogo
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* IMAGEM */}
        <div className="overflow-hidden rounded-2xl border border-[#49352b] bg-[#211713]">
          <img
            src={nft.imageUrl}
            alt={`Arte digital ${nft.name}`}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* INFORMAÇÕES */}
        <div>
          <p className="mb-3 text-sm font-medium text-[#e49a55]">
            {nft.collection}
          </p>

          <h1 className="text-4xl font-bold text-[#f5f0e8]">
            {nft.name}
          </h1>

          <p className="mt-3 text-sm text-[#b9a89b]">
            Criado por {nft.creator}
          </p>

          <p className="mt-6 leading-7 text-[#d3c5ba]">
            {nft.description}
          </p>

          <div className="mt-8 rounded-xl border border-[#49352b] bg-[#211713] p-6">
            <p className="text-sm text-[#b9a89b]">
              Preço por unidade
            </p>

            <p className="mt-2 text-3xl font-bold text-[#e49a55]">
              {nft.priceEth} ETH
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#b9a89b]">Rede</p>
                <p className="mt-1 font-semibold text-[#f5f0e8]">
                  {nft.network}
                </p>
              </div>

              <div>
                <p className="text-[#b9a89b]">Edição</p>
                <p className="mt-1 font-semibold text-[#f5f0e8]">
                  {nft.edition} de {nft.totalEditions}
                </p>
              </div>

              <div>
                <p className="text-[#b9a89b]">Disponibilidade</p>
                <p className="mt-1 font-semibold text-[#f5f0e8]">
                  {available} unidades
                </p>
              </div>
            </div>

            {/* QUANTIDADE */}
            <div className="mt-8">
              <label
                htmlFor="nft-quantity"
                className="mb-3 block text-sm font-medium text-[#f5f0e8]"
              >
                Quantidade
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  disabled={selectedQuantity <= 1 || available === 0}
                  className="h-11 w-11 rounded-lg border border-[#49352b] text-xl text-[#f5f0e8] disabled:opacity-40"
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>

                <input
                  id="nft-quantity"
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={selectedQuantity}
                  onChange={(event) => {
                    const value = Number(event.target.value)

                    if (Number.isFinite(value)) {
                      setQuantity(
                        Math.min(
                          maxQuantity,
                          Math.max(1, Math.trunc(value))
                        )
                      )
                    }
                  }}
                  disabled={available === 0}
                  className="h-11 w-20 rounded-lg border border-[#49352b] bg-[#120d0a] text-center text-[#f5f0e8]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(maxQuantity, current + 1)
                    )
                  }
                  disabled={
                    selectedQuantity >= available || available === 0
                  }
                  className="h-11 w-11 rounded-lg border border-[#49352b] text-xl text-[#f5f0e8] disabled:opacity-40"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
            </div>

            {/* AÇÕES */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
  type="button"
  onClick={() => void handleAddToCart()}
  disabled={available === 0 || addCartItem.isPending}
  className="flex-1 rounded-lg bg-[#e49a55] px-6 py-3 font-semibold text-[#120d0a] transition hover:bg-[#f1b579] disabled:cursor-not-allowed disabled:opacity-40"
>
  {available === 0
    ? 'Esgotado'
    : addCartItem.isPending
      ? 'Adicionando...'
      : 'Adicionar ao carrinho'}
</button>

              <button
                type="button"
                onClick={() => setIsFavorite((current) => !current)}
                aria-pressed={isFavorite}
                className="rounded-lg border border-[#49352b] px-5 py-3 text-[#f5f0e8] transition hover:border-[#e49a55]"
              >
                {isFavorite ? '♥ Favoritado' : '♡ Favoritar'}
              </button>
            </div>

            {cartMessage && (
  <p role="status" className="mt-3 text-sm text-green-400">
    {cartMessage}
  </p>
)}

{cartError && (
  <p role="alert" className="mt-3 text-sm text-red-400">
    {cartError}
  </p>
)}

            
          </div>
        </div>
      </div>
    </section>
  )
}
