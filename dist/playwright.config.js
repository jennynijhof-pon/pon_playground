"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_STATE = void 0;
require("dotenv/config");
const dotenv_1 = __importDefault(require("dotenv"));
const test_1 = require("@playwright/test");
const path_1 = __importDefault(require("path"));
// Read from .env file at root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '.env') });
exports.STORAGE_STATE = path_1.default.join(__dirname, 'src/auth/.auth/user.json');
exports.default = (0, test_1.defineConfig)({
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
                ...test_1.devices['Desktop Chrome'],
                storageState: exports.STORAGE_STATE,
            },
            dependencies: ['setup'],
        },
    ]
});
