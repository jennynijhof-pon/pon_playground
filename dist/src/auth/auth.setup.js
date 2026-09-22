"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
require("dotenv/config");
const playwright_config_1 = require("../../playwright.config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const tdgConfig_1 = require("../utils/tdgConfig");
async function isStoredAuthValid(browser) {
    if (!fs_1.default.existsSync(playwright_config_1.STORAGE_STATE)) {
        return false;
    }
    let context;
    try {
        context = await browser.newContext({ storageState: playwright_config_1.STORAGE_STATE });
        const page = await context.newPage();
        await page.goto(tdgConfig_1.tdgConfig.baseUrl, { waitUntil: 'domcontentloaded' });
        await (0, test_1.expect)(page.getByRole('button', { name: 'Search orders' })).toBeVisible({ timeout: 10000 });
        console.log('Stored authentication is still valid.');
        return true;
    }
    catch {
        console.log('Stored authentication is no longer valid; running login setup again.');
        return false;
    }
    finally {
        await context?.close();
    }
}
test_1.test.setTimeout(180000);
(0, test_1.test)('authenticate', async ({ page, browser }) => {
    if (await isStoredAuthValid(browser)) {
        return;
    }
    await page.goto(tdgConfig_1.tdgConfig.baseUrl);
    await (0, test_1.expect)(page.getByText('Welcome to Group Retail Portal')).toBeVisible();
    // Perform login
    await page.locator('#username').fill(tdgConfig_1.tdgConfig.email ?? '');
    await (0, test_1.expect)(page.locator('#username')).toHaveValue(tdgConfig_1.tdgConfig.email ?? '');
    await page.locator('#password').click();
    await page.locator('#password').evaluate((el, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, tdgConfig_1.tdgConfig.password ?? '');
    await page.getByRole('button', { name: 'login' }).click();
    await page.getByRole('button', { name: 'TOTP LOGIN' }).click();
    await (0, test_1.expect)(page.locator('#otp')).toBeVisible();
    await (page.locator('.brand-image')).waitFor({ state: 'visible', timeout: 120000 });
    fs_1.default.mkdirSync(path_1.default.dirname(playwright_config_1.STORAGE_STATE), { recursive: true });
    await page.context().storageState({ path: playwright_config_1.STORAGE_STATE });
});
