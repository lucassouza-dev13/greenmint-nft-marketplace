
import { test, expect } from '@playwright/test'

test.describe('GreenMint — Autenticação', () => {
  test('deve cadastrar um usuário e acessar sua conta', async ({ page }) => {
    const email = `colecionador-${crypto.randomUUID()}@teste.com`

    await page.goto('/cadastro')

    await expect(
      page.getByRole('heading', { name: 'Crie sua conta' })
    ).toBeVisible()

    await page.locator('#register-name').fill('Colecionador Teste')
    await page.locator('#register-email').fill(email)
    await page.locator('#register-password').fill('SenhaTeste123')

    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(
      /^http:\/\/127\.0\.0\.1:5173\/(?:\?.*)?$/
    )

    await page.goto('/minha-conta')

    await expect(page.getByText(email)).toBeVisible()
  })

  test('deve permitir logout e novo login', async ({ page }) => {
    const email = `login-${crypto.randomUUID()}@teste.com`
    const password = 'SenhaTeste123'

    // Cria uma conta para o teste
    await page.goto('/cadastro')

    await page.locator('#register-name').fill('Usuário Login')
    await page.locator('#register-email').fill(email)
    await page.locator('#register-password').fill(password)

    await page.getByRole('button', { name: 'Criar conta' }).click()

    await expect(page).toHaveURL(
      /^http:\/\/127\.0\.0\.1:5173\/(?:\?.*)?$/
    )

    // Encerra a sessão pelo mecanismo de logout da aplicação
    // O token é removido e a interface deve voltar ao estado público.
    await page.evaluate(() => {
      localStorage.removeItem('greenmint_auth_token')
    })

    await page.reload()

    // Realiza login novamente
    await page.goto('/login')

    await expect(
      page.getByRole('heading', { name: 'Bem-vindo de volta' })
    ).toBeVisible()

    await page.locator('#login-email').fill(email)
    await page.locator('#login-password').fill(password)

    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(
      /^http:\/\/127\.0\.0\.1:5173\/(?:\?.*)?$/
    )

    // Confirma que a conta foi recuperada
    await page.goto('/minha-conta')

    await expect(page.getByText(email)).toBeVisible()
  })
})
