import { test, expect } from '@playwright/test'

const GAME_INIT_TIMEOUT = 65000

test.describe.serial('Race Flow', () => {
  let page: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto('/')
    await page.locator('#ui-container .menu-title').waitFor({ timeout: GAME_INIT_TIMEOUT })
  })

  test.afterAll(async () => {
    if (page) await page.close()
  })

  test('navigate to track select', async () => {
    await page.locator('.menu-btn', { hasText: 'Start Race' }).click()
    await page.locator('.car-select-container').waitFor({ timeout: 5000 })

    await page.locator('.car-card').first().click()
    await page.locator('.car-preview-spec-name').waitFor({ timeout: 5000 })

    await page.locator('.menu-btn', { hasText: 'Continue' }).click()
    await expect(page.locator('.menu-btn', { hasText: 'Start Race' })).toBeVisible({ timeout: 5000 })
  })

  test('countdown starts and race begins', async () => {
    await page.locator('.menu-btn', { hasText: 'Start Race' }).evaluate(btn => (btn as HTMLButtonElement).click())

    await expect(page.locator('.countdown-number')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#hud')).toBeVisible({ timeout: 15000 })
  })

  test('race completes and shows results', async () => {
    await expect(page.locator('.results-container')).toBeVisible({ timeout: 60000 })

    await expect(page.locator('.results-position')).toBeVisible()
    const pos = await page.locator('.results-position').textContent()
    expect(pos?.length).toBeGreaterThan(0)

    await expect(page.locator('.results-label', { hasText: 'Total Time' })).toBeVisible()
    await expect(page.locator('.results-label', { hasText: 'Best Lap' })).toBeVisible()
    await expect(page.locator('.results-label', { hasText: 'Wall Hits' })).toBeVisible()
    await expect(page.locator('.results-label', { hasText: 'Top Speed' })).toBeVisible()

    await expect(page.locator('.results-buttons .menu-btn', { hasText: 'Race Again' })).toBeVisible()
    await expect(page.locator('.results-buttons .menu-btn', { hasText: 'Main Menu' })).toBeVisible()
  })

  test('Main Menu returns to main menu', async () => {
    await page.locator('.results-buttons .menu-btn', { hasText: 'Main Menu' }).click()
    await expect(page.locator('.menu-title')).toContainText('OCBP RACER', { timeout: 5000 })
  })
})
