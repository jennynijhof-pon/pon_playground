"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataGeneration = void 0;
const path_1 = __importDefault(require("path"));
class TestDataGeneration {
    constructor(page) {
        this.page = page;
        this.headerText = page.getByText('Testdata Generation');
        this.searchOrders = page.getByRole('button', { name: 'Search orders' });
        this.searchField = page.getByLabel('Values:');
        this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
        this.comOneButton = page.getByRole('button', { name: 'COM I', exact: true });
        this.loadWltpButton = page.getByRole('button', { name: 'Load WLTP', exact: true });
        this.scheduleVehicleButton = page.getByText('Scheduled', { exact: true });
    }
    async searchForVehicle(kommnummer) {
        await this.searchOrders.click();
        await this.searchField.fill(`211;${kommnummer};2026`);
        await this.searchButton.click();
    }
    async uploadWLTP(fileName) {
        const filePath = path_1.default.resolve('test-data/WLTP', fileName);
        await this.comOneButton.click();
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        await this.loadWltpButton.click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
    }
    async scheduleVehicle() {
        await this.scheduleVehicleButton.click();
    }
}
exports.TestDataGeneration = TestDataGeneration;
