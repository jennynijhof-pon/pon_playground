export const jiraConfig = {
  baseUrl: 'https://ponautomotive.atlassian.net/',
  email: process.env.JIRA_USERNAME,
  apiToken: process.env.JIRA_API_TOKEN,
  projectKey: process.env.JIRA_PROJECT_KEY, 
};