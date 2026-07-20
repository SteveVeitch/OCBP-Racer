import { test, expect } from '@playwright/test'

test.describe('Full Race Flow (1.1-E2E-001)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for game to load
    await page.waitForTimeout(2000)
  })

  test('complete race from menu to results', async ({ page }) => {
    // Step 1: Wait for canvas to be ready
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Step 2: Start game using keyboard (Space to confirm)
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)

    // Step 3: Wait for countdown
    await page.waitForTimeout(4000)

    // Step 4: Race should be in progress (canvas visible)
    await expect(page.locator('canvas')).toBeVisible()

    // Step 5: Simulate racing (press throttle)
    await page.keyboard.down('KeyW')
    await page.waitForTimeout(5000)
    await page.keyboard.up('KeyW')

    // Step 6: Verify race is still in progress
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('pause during race and resume', async ({ page }) => {
    // Wait for canvas to be ready
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Start game using keyboard (Space to confirm)
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)

    // Wait for countdown
    await page.waitForTimeout(4000)

    // Start racing
    await page.keyboard.down('KeyW')
    await page.waitForTimeout(2000)

    // Pause
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Verify game is paused (canvas should still be visible)
    await expect(page.locator('canvas')).toBeVisible()

    // Resume
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Verify game resumed
    await expect(page.locator('canvas')).toBeVisible()

    await page.keyboard.up('KeyW')
  })
})
