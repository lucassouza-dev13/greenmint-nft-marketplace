
import { test, expect } from '@playwright/test'

test.describe('GreenMint — Checkout', () => {
  test('deve concluir uma compra e manter o pedido após atualizar', async ({
    page,
  }) => {
    // Inicia com uma sessão limpa para evitar estoque e
    // carrinho de execuções anteriores.
    await page.goto('/')

    await page.evaluate(async () => {
      localStorage.removeItem('greenmint_session_id')
      localStorage.removeItem('greenmint_mock_carts_v1')
      localStorage.removeItem('greenmint_mock_orders_v1')
      localStorage.removeItem('greenmint_mock_nft_stock_v1')

      // Recarrega os módulos do MSW e os dados simulados.
      const registrations =
        await navigator.serviceWorker.getRegistrations()

      // Não removemos o Service Worker: ele é necessário
      // para interceptar as requisições da aplicação.
      void registrations
    })

    await page.reload()

    // Abre o NFT conhecido do catálogo.
    await page.goto('/nft/1')

    await expect(
      page.getByText('Emerald Ape', { exact: false }).first()
    ).toBeVisible()

    // Adiciona uma unidade ao carrinho.
    await page.getByRole('button', {
      name: /adicionar ao carrinho/i,
    }).click()

    // Acessa o carrinho.
    await page.goto('/carrinho')

    await expect(
      page.getByText('Emerald Ape', { exact: false }).first()
    ).toBeVisible()

    // Avança para o checkout.
    await page.getByRole('link', {
      name: /finalizar compra/i,
    }).click()

    await expect(
      page.getByRole('heading', {
        name: 'Finalizar compra',
      })
    ).toBeVisible()

    // Seleciona carteira e rede compatível com o NFT.
    await page.locator('#wallet-provider').selectOption('metamask')

    await page.locator('#wallet-address').fill(
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    )

    await page.locator('#payment-network').selectOption('ethereum')

    // Finaliza a compra simulada.
    await page.getByRole('button', {
      name: 'Confirmar compra',
    }).click()

    // Verifica a confirmação.
    await expect(page).toHaveURL(/\/pedido\/GM-/)

    await expect(
      page.getByText(/compra confirmada/i).first()
    ).toBeVisible()

    // Confirma que o pedido continua disponível após F5.
    await page.reload()

    await expect(
      page.getByText(/compra confirmada/i).first()
    ).toBeVisible()
  })
})
