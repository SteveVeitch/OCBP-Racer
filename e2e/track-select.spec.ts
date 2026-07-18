import { test, expect } from '@playwright/test'

const GAME_INIT_TIMEOUT = 65000

test.describe.serial('Track Selection', () => {
  let page: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto('/')
    await page.locator('#ui-container .menu-title').waitFor({ timeout: GAME_INIT_TIMEOUT })
    await page.locator('.menu-btn', { hasText: 'Start Race' }).click()
    await page.locator('.car-select-container').waitFor({ timeout: 5000 })
    await page.locator('.menu-btn', { hasText: 'Next' }).click()
    await page.locator('.car-preview-spec-name').waitFor({ timeout: 5000 })
    await page.locator('.menu-btn', { hasText: 'Continue' }).click()
    await page.locator('.menu-btn', { hasText: 'Start Race' }).waitFor({ timeout: 5000 })
  })

  test.afterAll(async () => {
    if (page) await page.close()
  })

  test('displays track start race button', async () => {
    await expect(page.locator('.menu-btn', { hasText: 'Start Race' })).toBeVisible()
  })

  test('has time of day override options', async () => {
    const nightBtn = page.locator('.settings-option', { hasText: 'Night' })
    await expect(nightBtn).toBeVisible()
  })

  test('has weather override options', async () => {
    const rainBtn = page.locator('.settings-option', { hasText: 'Rain' })
    await expect(rainBtn).toBeVisible()
  })

  test('Back returns to car preview', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await expect(page.locator('.car-preview-spec-name')).toBeVisible({ timeout: 5000 })
  })
})
