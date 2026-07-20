import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'src/e2e',
  timeout: 90000,
  retries: 0,
  workers: 1,
  outputDir: '_bmad-output/test-artifacts/test-results',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15000,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--enable-webgl',
        '--use-gl=swiftshader',
        '--enable-gpu-rasterization',
        '--ignore-gpu-blocklist',
        '--disable-gpu-sandbox',
        ...(process.env.CI ? ['--no-sandbox'] : []),
      ],
    },
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 30000,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: '_bmad-output/test-artifacts/test-results/test-results.json' }],
  ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
})
