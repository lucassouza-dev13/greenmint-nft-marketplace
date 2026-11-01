
import { test, expect } from '@playwright/test'

test.describe('GreenMint — Catálogo de NFTs', () => {
  test('deve carregar o catálogo com NFTs disponíveis', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/GreenMint/i)

    // Verifica um NFT conhecido na interface do catálogo.
    await expect(
      page.getByText('Emerald Ape', { exact: false }).first()
    ).toBeVisible({ timeout: 15_000 })

    // Confirma que o NFT permite navegar para seus detalhes.
    await expect(
      page.locator('a[href="/nft/1"]').first()
    ).toBeVisible()
  })

  test('deve abrir a página de detalhes de um NFT', async ({
    page,
  }) => {
    await page.goto('/nft/1')

    await expect(
      page.getByText('Emerald Ape', { exact: false }).first()
    ).toBeVisible()
  })
})
