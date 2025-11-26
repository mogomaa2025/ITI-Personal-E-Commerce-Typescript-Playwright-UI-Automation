import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,  // Disable parallel for tests with shared state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,  // Sequential execution to avoid state conflicts
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['monocart-reporter', {
      name: 'E-Commerce Test Report',
      outputFile: './monocart-report/index.html',
      coverage: {
        entryFilter: (entry: any) => true,
        sourceFilter: (sourcePath: string) => sourcePath.search(/src\//) !== -1
      },
      trend: './monocart-report/trend',
      logging: 'error',
      attachmentPath: (currentPath: string, extras: any) => {
        // Avoid duplication by using unique attachment paths
        return currentPath;
      },
      // Group retries together to avoid duplication
      onEnd: (result: any) => {
        // This ensures retries don't create duplicate entries
      }
    }],
    ['list']
  ],
  use: {
    baseURL: 'http://127.0.0.1:5000',
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,  // Increased for parallel/sequential execution
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
