"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tdgConfig = void 0;
exports.tdgConfig = {
    baseUrl: 'https://prelive-central.omd.cloud.vwgroup.com/omd-server/nadin/main/testdatagen/testdata?lc=3406448',
    email: process.env.JIRA_USERNAME,
    password: process.env.TDG_PASSWORD
};
