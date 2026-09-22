import { test, expect } from '@playwright/test';
import { JiraStatus } from '../src/types/jiraStatus.enums';
import { postIssueTransition, checkAuthUser, getIssueMetadata, editTicketDescription } from '../src/api/jiraClients'

const issueKey = 'RTERP-1210';

test.skip('Check authentication of the user', async ({}) => { 
  await checkAuthUser();
});

test.skip('get ticket status', async ({}) => {
  await postIssueTransition(issueKey, JiraStatus.TestsetVolledig);
});

test.skip('get issue metadata', async ({}) => { 
  await getIssueMetadata(issueKey);
});

test.skip(`update description for ${issueKey}`, async ({}) => { 
  await editTicketDescription(issueKey, 'Deze description is door playwright ingevuld')
});