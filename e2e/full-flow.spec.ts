import { test, expect } from '@playwright/test'

const GAME_INIT_TIMEOUT = 65000

test.describe.serial('Full Menu Flow', () => {
  let page: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto('/')
    await page.locator('#ui-container .menu-title').waitFor({ timeout: GAME_INIT_TIMEOUT })
  })

  test.afterAll(async () => {
    if (page) await page.close()
  })

  test('complete car selection flow', async () => {
    await page.locator('.menu-btn', { hasText: 'Start Race' }).click()
    await page.locator('.car-select-container').waitFor({ timeout: 5000 })

    await page.locator('.car-card').first().click()

    await page.locator('.menu-btn', { hasText: 'Next' }).click()
    await page.locator('.car-preview-spec-name').waitFor({ timeout: 5000 })

    const carName = await page.locator('.car-preview-spec-name').textContent()
    expect(carName?.length).toBeGreaterThan(0)

    await page.locator('.menu-btn', { hasText: 'Continue' }).click()
    await page.waitForTimeout(1000)

    await expect(page.locator('.menu-btn', { hasText: 'Start Race' })).toBeVisible()
  })

  test('back navigation works through all screens', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await page.locator('.car-preview-spec-name').waitFor({ timeout: 5000 })

    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await page.locator('.car-select-container').waitFor({ timeout: 5000 })

    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await expect(page.locator('.menu-title')).toContainText('OCBP RACER', { timeout: 5000 })
  })

  test('settings and leaderboard navigation', async () => {
    await page.locator('.menu-btn', { hasText: 'Settings' }).click()
    await page.locator('.settings-title').waitFor({ timeout: 5000 })

    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await page.locator('.menu-title', { hasText: 'OCBP RACER' }).waitFor({ timeout: 5000 })

    await page.locator('.menu-btn', { hasText: 'Leaderboard' }).click()
    await page.locator('.menu-title', { hasText: 'LEADERBOARD' }).waitFor({ timeout: 5000 })

    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await expect(page.locator('.menu-title')).toContainText('OCBP RACER', { timeout: 5000 })
  })
})
