"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const jiraStatus_enums_1 = require("../src/types/jiraStatus.enums");
const jiraClients_1 = require("../src/api/jiraClients");
const issueKey = 'RTERP-1210';
test_1.test.skip('Check authentication of the user', async ({}) => {
    await (0, jiraClients_1.checkAuthUser)();
});
test_1.test.skip('get ticket status', async ({}) => {
    await (0, jiraClients_1.postIssueTransition)(issueKey, jiraStatus_enums_1.JiraStatus.TestsetVolledig);
});
test_1.test.skip('get issue metadata', async ({}) => {
    await (0, jiraClients_1.getIssueMetadata)(issueKey);
});
test_1.test.skip(`update description for ${issueKey}`, async ({}) => {
    await (0, jiraClients_1.editTicketDescription)(issueKey, 'Deze description is door playwright ingevuld');
});
