import { test, expect } from '@playwright/test'

const GAME_INIT_TIMEOUT = 65000

test.describe.serial('Main Menu', () => {
  let page: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto('/')
    await page.locator('#ui-container .menu-title').waitFor({ timeout: GAME_INIT_TIMEOUT })
  })

  test.afterAll(async () => {
    if (page) await page.close()
  })

  test('displays game title and buttons', async () => {
    await expect(page.locator('.menu-title')).toContainText('OCBP RACER')
    await expect(page.locator('.menu-subtitle')).toContainText('Street Racing')
    await expect(page.locator('.menu-btn', { hasText: 'Start Race' })).toBeVisible()
    await expect(page.locator('.menu-btn', { hasText: 'Settings' })).toBeVisible()
    await expect(page.locator('.menu-btn', { hasText: 'Leaderboard' })).toBeVisible()
  })

  test('displays version number', async () => {
    await expect(page.locator('.version-text')).toContainText('v')
  })

  test('navigates to car select on Start Race', async () => {
    await page.locator('.menu-btn', { hasText: 'Start Race' }).click()
    await expect(page.locator('.car-select-container')).toBeVisible({ timeout: 5000 })
  })

  test('navigates to settings', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await page.locator('.menu-title').waitFor({ timeout: 5000 })
    await page.locator('.menu-btn', { hasText: 'Settings' }).click()
    await expect(page.locator('.settings-title')).toBeVisible({ timeout: 5000 })
  })

  test('navigates to leaderboard', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await page.locator('.menu-title').waitFor({ timeout: 5000 })
    await page.locator('.menu-btn', { hasText: 'Leaderboard' }).click()
    await expect(page.locator('.menu-title', { hasText: 'LEADERBOARD' })).toBeVisible({ timeout: 5000 })
  })
})
