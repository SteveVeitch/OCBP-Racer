import { test, expect } from '@playwright/test'

const GAME_INIT_TIMEOUT = 65000

test.describe.serial('Settings', () => {
  let page: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto('/')
    await page.locator('#ui-container .menu-title').waitFor({ timeout: GAME_INIT_TIMEOUT })
    await page.locator('.menu-btn', { hasText: 'Settings' }).click()
    await page.locator('.settings-title').waitFor({ timeout: 5000 })
  })

  test.afterAll(async () => {
    if (page) await page.close()
  })

  test('displays settings title', async () => {
    await expect(page.locator('.settings-title')).toContainText('Settings')
  })

  test('has volume slider', async () => {
    const slider = page.locator('.settings-slider').first()
    await expect(slider).toBeVisible()
  })

  test('has speed unit options (MPH/KPH)', async () => {
    const mph = page.locator('.settings-option', { hasText: 'MPH' })
    const kph = page.locator('.settings-option', { hasText: 'KPH' })
    await expect(mph).toBeVisible()
    await expect(kph).toBeVisible()
  })

  test('has graphics quality options', async () => {
    const low = page.locator('.settings-option', { hasText: 'Low' })
    const medium = page.locator('.settings-option', { hasText: 'Medium' })
    const high = page.locator('.settings-option', { hasText: 'High' })
    await expect(low).toBeVisible()
    await expect(medium).toBeVisible()
    await expect(high).toBeVisible()
  })

  test('Back returns to main menu', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await expect(page.locator('.menu-title')).toContainText('OCBP RACER', { timeout: 5000 })
  })
})
