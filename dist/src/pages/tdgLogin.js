"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TdgLogin = void 0;
const tdgConfig_1 = require("../utils/tdgConfig");
const test_1 = require("@playwright/test");
class TdgLogin {
    constructor(page) {
        this.page = page;
    }
    async visitTestDataGenerator() {
        await this.page.goto(tdgConfig_1.tdgConfig.baseUrl);
        await (0, test_1.expect)(this.page.getByRole('button', { name: 'Search orders' })).toBeVisible();
    }
}
exports.TdgLogin = TdgLogin;
