
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Hero } from './Hero'
import { useNFTs } from '../hooks/useNFTs'
import type { NFT } from '../../../types/nft'

export function NFTCatalog() {
  const navigate = useNavigate({ from: '/' })
  const filters = useSearch({ from: '/' })

  const [searchText, setSearchText] = useState(
    filters.search ?? ''
  )

  const latestSearchRef = useRef(filters.search ?? '')

  // Mantém a referência da busca atualizada
  useEffect(() => {
    latestSearchRef.current = filters.search ?? ''
  }, [filters.search])

  // Atualiza a URL após o usuário parar de digitar
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const value = searchText.trim()

      if (value === latestSearchRef.current) {
        return
      }

      latestSearchRef.current = value

      void navigate({
        to: '/',
        search: (previous) => ({
          ...previous,
          search: value || undefined,
          page: 1,
        }),
        replace: true,
        resetScroll: false,
      })
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [searchText, navigate])

  // Consulta a API usando os filtros da URL
  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useNFTs({
    search: filters.search,
    collection: filters.collection,
    network: filters.network,
    sort: filters.sort,
    page: filters.page ?? 1,
    limit: 6,
  })

  function changeNetwork(value: string) {
    const network: NFT['network'] | undefined =
      value === 'ethereum' ||
      value === 'polygon' ||
      value === 'solana'
        ? value
        : undefined

    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        network,
        page: 1,
      }),
      replace: true,
      resetScroll: false,
    })
  }

  function changeSort(value: string) {
    const sort: 'newest' | 'price_asc' | 'price_desc' =
      value === 'price_asc' || value === 'price_desc'
        ? value
        : 'newest'

    void navigate({
      to: '/',
      search: (previous) => ({
        ...previous,
        sort,
        page: 1,
      }),
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <>
      <Hero />

      <section
        id="catalogo"
        className="mx-auto min-h-[1000px] max-w-7xl scroll-mt-8 px-6 py-12 md:px-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#f5f0e8]">
            Explore nossos NFTs
          </h2>

          <p className="mt-2 text-sm text-[#b9a89b]">
            Descubra artes digitais exclusivas.
          </p>
        </div>

        {/* CAMPO DE BUSCA */}
        <div className="mb-6">
          <label
            htmlFor="nft-search"
            className="mb-2 block text-sm font-medium text-[#f5f0e8]"
          >
            Buscar NFT
          </label>

          <input
            id="nft-search"
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Digite o nome de um NFT..."
            className="w-full rounded-lg border border-[#49352b] bg-[#211713] px-4 py-3 text-[#f5f0e8] outline-none placeholder:text-[#8d7a6f] focus:border-[#e49a55]"
          />
        </div>

        {/* FILTROS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="network-filter"
              className="mb-2 block text-sm font-medium text-[#f5f0e8]"
            >
              Rede
            </label>

            <select
              id="network-filter"
              value={filters.network ?? ''}
              onChange={(event) =>
                changeNetwork(event.target.value)
              }
              className="w-full rounded-lg border border-[#49352b] bg-[#211713] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
            >
              <option value="">Todas as redes</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort-filter"
              className="mb-2 block text-sm font-medium text-[#f5f0e8]"
            >
              Ordenar por
            </label>

            <select
              id="sort-filter"
              value={filters.sort ?? 'newest'}
              onChange={(event) =>
                changeSort(event.target.value)
              }
              className="w-full rounded-lg border border-[#49352b] bg-[#211713] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
            >
              <option value="newest">Mais recentes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
            </select>
          </div>
        </div>

        {/* RESULTADOS */}
        {isPending ? (
          <div
            aria-busy="true"
            className="py-12 text-center"
          >
            <p className="text-[#b9a89b]">
              Carregando NFTs...
            </p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-red-400">
              Não foi possível carregar os NFTs.
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-[#e49a55] px-5 py-3 font-semibold text-[#120d0a]"
            >
              Tentar novamente
            </button>
          </div>
        ) : !data ? (
          <div className="py-12 text-center text-[#b9a89b]">
            Não foi possível obter os dados do catálogo.
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#b9a89b]">
                {data.total} NFTs encontrados
              </p>

              {isFetching && (
                <span
                  role="status"
                  className="text-xs text-[#e49a55]"
                >
                  Atualizando resultados...
                </span>
              )}
            </div>

            {data.items.length === 0 ? (
              <div className="rounded-xl border border-[#49352b] bg-[#211713] px-6 py-12 text-center">
                <p className="text-[#f5f0e8]">
                  Nenhum NFT encontrado.
                </p>
                <p className="mt-2 text-sm text-[#b9a89b]">
                  Tente alterar sua busca ou seus filtros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((nft) => (
                  <article
                    key={nft.id}
                    className="overflow-hidden rounded-xl border border-[#49352b] bg-[#211713] text-[#f5f0e8] transition-transform duration-200 hover:-translate-y-1"
                  >
                    
                <Link
                to="/nft/$nftId"
                params={{ nftId: nft.id }}
                aria-label={`Ver detalhes de ${nft.name}`}
                className="block aspect-square overflow-hidden bg-[#30221c]"
                >
                <img
                src={nft.imageUrl}
              alt={`Arte digital do NFT ${nft.name}`}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              decoding="async"
              />
              </Link>


                    <div className="p-4">
                      <h3 className="text-lg font-semibold">
                        {nft.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#b9a89b]">
                        {nft.collection}
                      </p>

                      <p className="mt-3 font-bold text-[#e49a55]">
                        {nft.priceEth} ETH
                      </p>

                      <p className="mt-2 text-xs text-[#b9a89b]">
                        Rede: {nft.network}
                      </p>

                      <p className="mt-1 text-xs text-[#b9a89b]">
                        Disponíveis: {nft.availableQuantity}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
