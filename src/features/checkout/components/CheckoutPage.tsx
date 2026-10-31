
import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { Wallet, ShieldCheck, ArrowLeft } from 'lucide-react'

import { useCart } from '../../cart/hooks/useCart'
import { useCreateOrder } from '../hooks/useOrders'

import type {
  PaymentNetwork,
  WalletProvider,
} from '../../../types/order'

const walletOptions: {
  value: WalletProvider
  label: string
}[] = [
  { value: 'metamask', label: 'MetaMask' },
  { value: 'walletconnect', label: 'WalletConnect' },
  { value: 'coinbase', label: 'Coinbase Wallet' },
]

const networkOptions: {
  value: PaymentNetwork
  label: string
}[] = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'solana', label: 'Solana' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isPending, isError } = useCart()
  const createOrder = useCreateOrder()

  const [walletProvider, setWalletProvider] =
    useState<WalletProvider>('metamask')

  const [network, setNetwork] =
    useState<PaymentNetwork>('ethereum')

  const [walletAddress, setWalletAddress] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  async function handleCheckout() {
    setErrorMessage('')

    if (!walletAddress.trim()) {
      setErrorMessage('Informe o endereço da carteira.')
      return
    }

    if (!cart || cart.items.length === 0) {
      setErrorMessage('Seu carrinho está vazio.')
      return
    }

    if (cart.items.some((item) => item.nft.network !== network)) {
      setErrorMessage(
        'Todos os NFTs precisam pertencer à rede selecionada.'
      )
      return
    }

    try {
      const order = await createOrder.mutateAsync({
        walletProvider,
        walletAddress: walletAddress.trim(),
        network,
        idempotencyKey,
      })

      await navigate({
        to: '/pedido/$orderId',
        params: { orderId: order.id },
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            'Não foi possível finalizar a compra.'
        )
      } else {
        setErrorMessage('Ocorreu um erro inesperado.')
      }
    }
  }

  if (isPending) {
    return (
      <div className="py-20 text-center text-[#b9a89b]">
        Carregando checkout...
      </div>
    )
  }

  if (isError || !cart) {
    return (
      <div className="py-20 text-center text-red-400">
        Não foi possível carregar o carrinho.
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-[#f5f0e8]">
          Seu carrinho está vazio
        </h1>
        <Link
          to="/"
          className="mt-6 inline-block text-[#e49a55] hover:underline"
        >
          Explorar NFTs
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link
        to="/carrinho"
        className="inline-flex items-center gap-2 text-sm text-[#e49a55]"
      >
        <ArrowLeft size={16} />
        Voltar ao carrinho
      </Link>

      <h1 className="mt-6 text-4xl font-bold text-[#f5f0e8]">
        Finalizar compra
      </h1>

      <p className="mt-2 text-[#b9a89b]">
        Revise os dados para concluir sua compra simulada.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#49352b] bg-[#211713] p-6">
            <div className="mb-5 flex items-center gap-3">
              <Wallet className="text-[#e49a55]" size={22} />
              <h2 className="text-xl font-bold text-[#f5f0e8]">
                Carteira digital
              </h2>
            </div>

            <label
              htmlFor="wallet-provider"
              className="mb-2 block text-sm text-[#b9a89b]"
            >
              Selecione sua carteira
            </label>

            <select
              id="wallet-provider"
              value={walletProvider}
              onChange={(event) =>
                setWalletProvider(
                  event.target.value as WalletProvider
                )
              }
              className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8]"
            >
              {walletOptions.map((wallet) => (
                <option key={wallet.value} value={wallet.value}>
                  {wallet.label}
                </option>
              ))}
            </select>

            <label
              htmlFor="wallet-address"
              className="mb-2 mt-5 block text-sm text-[#b9a89b]"
            >
              Endereço da carteira
            </label>

            <input
              id="wallet-address"
              value={walletAddress}
              onChange={(event) =>
                setWalletAddress(event.target.value)
              }
              placeholder="Informe o endereço da carteira"
              autoComplete="off"
              className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8] outline-none focus:border-[#e49a55]"
            />

            <p className="mt-3 text-xs text-[#b9a89b]">
              Ambiente demonstrativo. Nenhuma transação real
              será realizada.
            </p>
          </div>

          <div className="rounded-xl border border-[#49352b] bg-[#211713] p-6">
            <h2 className="mb-4 text-xl font-bold text-[#f5f0e8]">
              Rede blockchain
            </h2>

            <label
              htmlFor="payment-network"
              className="mb-2 block text-sm text-[#b9a89b]"
            >
              Selecione a rede
            </label>

            <select
              id="payment-network"
              value={network}
              onChange={(event) =>
                setNetwork(
                  event.target.value as PaymentNetwork
                )
              }
              className="w-full rounded-lg border border-[#49352b] bg-[#120d0a] px-4 py-3 text-[#f5f0e8]"
            >
              {networkOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#49352b] bg-[#211713] p-5">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-[#e49a55]"
              size={22}
            />
            <p className="text-sm text-[#b9a89b]">
              Esta é uma compra simulada. O pedido será
              registrado na API mockada do GreenMint.
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-[#49352b] bg-[#211713] p-6">
          <h2 className="text-xl font-bold text-[#f5f0e8]">
            Resumo do pedido
          </h2>

          <div className="mt-5 space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.nftId}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="text-[#b9a89b]">
                  {item.nft.name} × {item.quantity}
                </span>
                <span className="text-[#f5f0e8]">
                  {item.nft.priceEth} ETH/un.
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-[#49352b] pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#b9a89b]">Subtotal</span>
              <span className="text-[#f5f0e8]">
                {cart.subtotalEth} ETH
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#b9a89b]">Desconto</span>
              <span className="text-green-400">
                − {cart.discountEth} ETH
              </span>
            </div>

            <div className="flex justify-between border-t border-[#49352b] pt-4">
              <span className="font-bold text-[#f5f0e8]">
                Total
              </span>
              <span className="text-xl font-bold text-[#e49a55]">
                {cart.totalEth} ETH
              </span>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mt-5 text-sm text-red-400"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleCheckout()}
            disabled={createOrder.isPending}
            className="mt-6 w-full rounded-lg bg-[#e49a55] px-5 py-3 font-bold text-[#120d0a] transition hover:bg-[#f1b579] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createOrder.isPending
              ? 'Processando pedido...'
              : 'Confirmar compra'}
          </button>
        </aside>
      </div>
    </section>
  )
}
