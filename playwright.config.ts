import 'dotenv/config';
import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Read from .env file at root
dotenv.config({ path: path.resolve(__dirname, '.env') });

export const STORAGE_STATE = path.join(__dirname, 'src/auth/.auth/user.json');

export default defineConfig({
  testDir: '.',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    actionTimeout: 0,
    trace: 'on'
  },
  projects: [
    // Setup project that runs first
    {
      name: 'audi-api-setup',
      testMatch: /src\/setup\/audi-api\.setup\.ts/,
    },
    {
      name: 'setup',
      testMatch: /src\/auth\/auth\.setup\.ts/,
      dependencies: ['audi-api-setup'],
    },
    {
      name: 'chromium',
      testMatch: /tests\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ]
});
