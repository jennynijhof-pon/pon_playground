import { test as setup, expect, type Browser, type BrowserContext } from '@playwright/test';
import 'dotenv/config';
import { STORAGE_STATE } from '../../playwright.config';
import fs from 'fs';
import path from 'path';
import { tdgConfig } from '../utils/tdgConfig';

async function isStoredAuthValid(browser: Browser): Promise<boolean> {
  if (!fs.existsSync(STORAGE_STATE)) {
    return false;
  }

  let context: BrowserContext | undefined;

  try {
    context = await browser.newContext({ storageState: STORAGE_STATE });
    const page = await context.newPage();
    await page.goto(tdgConfig.baseUrl, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Search orders' })).toBeVisible({ timeout: 10000 });
    console.log('Stored authentication is still valid.');
    return true;
  } catch {
    console.log('Stored authentication is no longer valid; running login setup again.');
    return false;
  } finally {
    await context?.close();
  }
}

setup.setTimeout(180000);

setup('authenticate', async ({ page, browser }) => {
  if (await isStoredAuthValid(browser)) {
    return;
  }

  await page.goto(tdgConfig.baseUrl);
  await expect(page.getByText('Welcome to Group Retail Portal')).toBeVisible();

  // Perform login
  await page.locator('#username').fill(tdgConfig.email ?? '');
  await expect (page.locator('#username')).toHaveValue(tdgConfig.email ?? '');
  await page.locator('#password').click()
  await page.locator('#password').evaluate((el: HTMLInputElement, val: string) => {
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, tdgConfig.password ?? '');

  await page.getByRole('button', { name: 'login' }).click();

  await page.getByRole('button', { name: 'TOTP LOGIN'}).click();
  await expect(page.locator('#otp')).toBeVisible(); 


  await (page.locator('.brand-image')).waitFor({ state: 'visible', timeout: 120000 });

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
