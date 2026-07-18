import { test, expect } from '@playwright/test'

const GAME_INIT_TIMEOUT = 65000

test.describe.serial('Car Selection', () => {
  let page: import('@playwright/test').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto('/')
    await page.locator('#ui-container .menu-title').waitFor({ timeout: GAME_INIT_TIMEOUT })
    await page.locator('.menu-btn', { hasText: 'Start Race' }).click()
    await page.locator('.car-select-container').waitFor({ timeout: 5000 })
  })

  test.afterAll(async () => {
    if (page) await page.close()
  })

  test('displays car cards', async () => {
    const cards = page.locator('.car-card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('first car is selected by default', async () => {
    await expect(page.locator('.car-card.selected')).toHaveCount(1)
  })

  test('clicking a car selects it', async () => {
    const secondCar = page.locator('.car-card').nth(1)
    if (await secondCar.count() > 0) {
      await secondCar.click()
      await expect(secondCar).toHaveClass(/selected/)
    } else {
      const firstCar = page.locator('.car-card').first()
      await firstCar.click()
      await expect(firstCar).toHaveClass(/selected/)
    }
  })

  test('Next goes to car preview', async () => {
    await page.locator('.menu-btn', { hasText: 'Next' }).click()
    await expect(page.locator('.car-preview-spec-name')).toBeVisible({ timeout: 5000 })
  })

  test('Back returns to car select', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await expect(page.locator('.car-select-container')).toBeVisible({ timeout: 5000 })
  })

  test('Back from car select returns to main menu', async () => {
    await page.locator('.menu-btn', { hasText: 'Back' }).click()
    await expect(page.locator('.menu-title')).toContainText('OCBP RACER', { timeout: 5000 })
  })
})
