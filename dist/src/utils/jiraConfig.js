"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jiraConfig = void 0;
exports.jiraConfig = {
    baseUrl: 'https://ponautomotive.atlassian.net/',
    email: process.env.JIRA_USERNAME,
    apiToken: process.env.JIRA_API_TOKEN,
    projectKey: process.env.JIRA_PROJECT_KEY,
};
