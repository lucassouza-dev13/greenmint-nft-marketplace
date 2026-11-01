
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import { NFTCatalog } from '../features/catalog/components/NFTCatalog'
import { Header } from '../components/layout/Header'
import { NFTDetail } from '../features/catalog/components/NFTDetail'
import { CartPage } from '../features/cart/components/CartPage'
import { CheckoutPage } from '../features/checkout/components/CheckoutPage'
import OrderConfirmationPage from '../features/checkout/components/OrderConfirmationPage'
import { LoginPage } from '../features/auth/components/LoginPage'
import { RegisterPage } from '../features/auth/components/RegisterPage'
function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main id="main-content">
        <Outlet />
      </main>
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

// ROTA PRINCIPAL - CATÁLOGO
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',

  validateSearch: (search): {
    search?: string
    collection?: string
    network?: 'ethereum' | 'polygon' | 'solana'
    sort?: 'newest' | 'price_asc' | 'price_desc'
    page?: number
  } => {
    const params = search as Record<string, unknown>

    const searchText =
      typeof params.search === 'string'
        ? params.search.trim()
        : ''

    const collection =
      typeof params.collection === 'string'
        ? params.collection
        : ''

    const network =
      params.network === 'ethereum' ||
      params.network === 'polygon' ||
      params.network === 'solana'
        ? params.network
        : undefined

    const sort =
      params.sort === 'price_asc' ||
      params.sort === 'price_desc'
        ? params.sort
        : 'newest'

    const rawPage = Number(params.page ?? 1)

    const page =
      Number.isSafeInteger(rawPage) && rawPage > 0
        ? rawPage
        : 1

    return {
      ...(searchText && { search: searchText }),
      ...(collection && { collection }),
      ...(network && { network }),
      sort,
      page,
    }
  },

  component: NFTCatalog,
})

// ROTA DE DETALHES DO NFT
const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: NFTDetail,
})

// ROTA DE LOGIN
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cadastro',
  component: RegisterPage,
})

// ROTA DO CARRINHO
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carrinho',
  component: CartPage,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
})

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pedido/$orderId',
  component: OrderConfirmationPage,
})

// REGISTRO DAS ROTAS
const routeTree = rootRoute.addChildren([
  homeRoute,
  nftDetailRoute,
  loginRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  registerRoute,
])

export const router = createRouter({
  routeTree,

  defaultNotFoundComponent: () => (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Página não encontrada
      </h1>
    </main>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
