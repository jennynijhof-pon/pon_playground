"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJiraBug = createJiraBug;
exports.attachFileToIssue = attachFileToIssue;
exports.getTicketStatus = getTicketStatus;
exports.getProject = getProject;
exports.getProjectFromTicket = getProjectFromTicket;
exports.checkAuthUser = checkAuthUser;
exports.postIssueTransition = postIssueTransition;
exports.getIssueMetadata = getIssueMetadata;
exports.editTicketDescription = editTicketDescription;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const jiraConfig_1 = require("../utils/jiraConfig");
// Basic Auth header
const authHeader = `Basic ${Buffer.from(`${jiraConfig_1.jiraConfig.email}:${jiraConfig_1.jiraConfig.apiToken}`).toString('base64')}`;
// Create Jira bug
async function createJiraBug(summary, description) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/2/issue`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fields: {
                project: { key: jiraConfig_1.jiraConfig.projectKey },
                summary,
                description,
                issuetype: { name: 'Bug' },
            },
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`❌ Jira issue creation failed: ${JSON.stringify(data)}`);
    }
    console.log(`✅ Bug created with key: ${data.key}`);
    return data.key;
}
// Attach file to bug
async function attachFileToIssue(issueKey, filePath) {
    const form = new form_data_1.default();
    form.append('file', fs_1.default.createReadStream(path_1.default.resolve(filePath)));
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/2/issue/${issueKey}/attachments`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'X-Atlassian-Token': 'no-check',
            // Don't set Content-Type manually for form-data
        },
        body: form,
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(`❌ File attachment failed: ${JSON.stringify(data)}`);
    }
    console.log('📎 File attached successfully.');
}
// Get Jira ticket status
async function getTicketStatus(issueKey) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/api/2.0.alpha1/issue/${issueKey}/transitions`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch status for ${issueKey}: ${response.status}, ${response.statusText}`);
    }
    const data = (await response.json());
    return data.fields.status.name;
}
// Get Jira project
async function getProject(projectKey) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/3/project/${projectKey}`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch project for ${projectKey}: ${response.status}, ${response.statusText}`);
    }
    const data = (await response.json());
    return data.fields.project.key === projectKey;
}
// Get Jira project from the issue
async function getProjectFromTicket(issueKey) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}?fields=project`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ticket ${issueKey}: ${response.status}, ${response.statusText}`);
    }
    const data = (await response.json());
    const projectKey = data.fields.project.key;
    return projectKey;
}
// Check of the auth of the user is still valid
async function checkAuthUser() {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
        }
    });
    if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}, ${response.statusText}`);
    }
    console.log('Authentication working for this user!');
    const data = (await response.json());
    return data.emailAddress;
}
// Post list of possible issue transitions
async function postIssueTransition(issueKey, transitionId) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transition: {
                id: transitionId
            }
        })
    });
    if (!response.ok) {
        throw new Error(`Failed to transition ticket ${issueKey}: ${response.status}, ${response.statusText}`);
    }
    console.log(`Successfully transitioned ticket ${issueKey} using transition ID ${transitionId}`);
    return response.ok;
}
// Get issue metadata
async function getIssueMetadata(issueKey) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}/editmeta`, {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch metadata for ${issueKey}: ${response.status}, ${response.statusText}`);
    }
    const data = (await response.json());
    console.log('Full Editable Fields Metadata:', JSON.stringify(data.fields, null, 2));
}
// Edit ticket description
async function editTicketDescription(issueKey, newDescription) {
    const response = await (0, node_fetch_1.default)(`${jiraConfig_1.jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}`, {
        method: 'PUT',
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fields: {
                description: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: newDescription,
                                },
                            ],
                        },
                    ],
                },
            },
        }),
    });
    if (!response.ok) {
        throw new Error(`Failed to update description for ${issueKey}: ${response.status}, ${response.statusText}`);
    }
    console.log(`Successfully updated description for ticket ${issueKey}`);
    return response.ok;
}
