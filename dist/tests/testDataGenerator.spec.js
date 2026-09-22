"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const tdgLogin_1 = require("../src/pages/tdgLogin");
const TestDataGenerator_1 = require("../src/pages/TestDataGenerator");
async function getVehicles() {
    const vehiclesFile = path_1.default.resolve(process.cwd(), 'test-data/verhicles/audi-vehicles.json');
    const vehicles = await (0, promises_1.readFile)(vehiclesFile, 'utf-8');
    return JSON.parse(vehicles);
}
test_1.test.describe('Aanmaken testdata in TDG', () => {
    let tdgLogin;
    let searchVehicle;
    test_1.test.beforeEach(({ page }) => {
        tdgLogin = new tdgLogin_1.TdgLogin(page);
        searchVehicle = new TestDataGenerator_1.TestDataGeneration(page);
    });
    (0, test_1.test)(`Change the order status to Scheduled`, async ({ page }) => {
        const vehicles = await getVehicles();
        for (const vehicle of vehicles) {
            await test_1.test.step('navigate to the Test Data Generation', async () => {
                await tdgLogin.visitTestDataGenerator();
            });
            await test_1.test.step(`Search for vehicle with kommnummer ${vehicle.kommnummer}`, async () => {
                await (0, test_1.expect)(searchVehicle.headerText).toBeVisible();
                await searchVehicle.searchForVehicle(vehicle.kommnummer);
                const tdgKommnummer = page.getByRole('cell', { name: vehicle.kommnummer });
                await (0, test_1.expect)(tdgKommnummer).toHaveText(vehicle.kommnummer);
            });
            await test_1.test.step(`Upload the WLTP file (COM 1) for vehicle with kommnummer ${vehicle.kommnummer}`, async () => {
                await searchVehicle.uploadWLTP(vehicle.filename);
                const confirmDataLoaded = page.locator('span', { hasText: 'Data Loaded.' });
                await (0, test_1.expect)(confirmDataLoaded).toBeVisible();
            });
            await test_1.test.step('Click the "scheduled" switch', async () => {
                await searchVehicle.scheduleVehicle();
                const frozenPeriodSwitch = page.getByRole('switch', { name: 'Frozen Period' });
                const scheduledSwitch = page.getByRole('switch', { name: 'Scheduled' });
                await (0, test_1.expect)(frozenPeriodSwitch).toHaveAttribute('aria-checked', 'true');
                await (0, test_1.expect)(scheduledSwitch).toHaveAttribute('aria-checked', 'true');
            });
        }
    });
});
