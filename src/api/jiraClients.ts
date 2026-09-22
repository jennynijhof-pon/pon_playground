import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { jiraConfig } from '../utils/jiraConfig';

// Basic Auth header
const authHeader = `Basic ${Buffer.from(`${jiraConfig.email}:${jiraConfig.apiToken}`).toString('base64')}`;

// Create Jira bug
export async function createJiraBug(summary: string, description: string): Promise<string> {
  const response = await fetch(`${jiraConfig.baseUrl}/rest/api/2/issue`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        project: { key: jiraConfig.projectKey },
        summary,
        description,
        issuetype: { name: 'Bug' },
      },
    }),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new Error(`❌ Jira issue creation failed: ${JSON.stringify(data)}`);
  }

  console.log(`✅ Bug created with key: ${data.key}`);
  return data.key;
}
// Attach file to bug
export async function attachFileToIssue(issueKey: string, filePath: string): Promise<void> {
  const form = new FormData();
  form.append('file', fs.createReadStream(path.resolve(filePath)));

  const response = await fetch(`${jiraConfig.baseUrl}/rest/api/2/issue/${issueKey}/attachments`, {
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
export async function getTicketStatus(issueKey: string): Promise<string> {
    const response = await fetch(`${jiraConfig.baseUrl}/api/2.0.alpha1/issue/${issueKey}/transitions`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    }
  }); 

  if(!response.ok) {
   throw new Error(`Failed to fetch status for ${issueKey}: ${response.status}, ${response.statusText}`)
  }

  const data = (await response.json()) as any;
  return data.fields.status.name; 
}

// Get Jira project
export async function getProject(projectKey: string): Promise<boolean> {
    const response = await fetch(`${jiraConfig.baseUrl}/rest/api/3/project/${projectKey}`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
    }
  }); 

  if(!response.ok) {
   throw new Error(`Failed to fetch project for ${projectKey}: ${response.status}, ${response.statusText}`)
  }

  const data = (await response.json()) as any;
  return data.fields.project.key === projectKey; 

}

// Get Jira project from the issue
export async function getProjectFromTicket(issueKey: string ): Promise<string> {
    const response = await fetch(`${jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}?fields=project`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
    }
  }); 

  if(!response.ok) {
      throw new Error(`Failed to fetch ticket ${issueKey}: ${response.status}, ${response.statusText}`);
  }

  const data = (await response.json()) as any;

  const projectKey = data.fields.project.key;
  return projectKey;
}

// Check of the auth of the user is still valid
export async function checkAuthUser(): Promise<string> {
  const response = await fetch(`${jiraConfig.baseUrl}/rest/api/3/myself`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
    }
  }); 

  if(!response.ok) {
    throw new Error(`Auth check failed: ${response.status}, ${response.statusText}`);
  }

  console.log('Authentication working for this user!')

  const data = (await response.json()) as any;
  return data.emailAddress;
}

// Post list of possible issue transitions
export async function postIssueTransition(issueKey: string, transitionId: string ): Promise<boolean> {
    const response = await fetch(`${jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}/transitions`, {
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

  if(!response.ok) {
      throw new Error(`Failed to transition ticket ${issueKey}: ${response.status}, ${response.statusText}`);
  }
  console.log(`Successfully transitioned ticket ${issueKey} using transition ID ${transitionId}`)
  return response.ok;
}

// Get issue metadata
export async function getIssueMetadata(issueKey: string): Promise<any> {
    const response = await fetch(`${jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}/editmeta`, {
      method: 'GET',
      headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
      }
    }); 

  if(!response.ok) {
      throw new Error(`Failed to fetch metadata for ${issueKey}: ${response.status}, ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  console.log('Full Editable Fields Metadata:', JSON.stringify(data.fields, null, 2));

}

// Edit ticket description
export async function editTicketDescription(issueKey: string , newDescription: string) {
    const response = await fetch(`${jiraConfig.baseUrl}/rest/api/3/issue/${issueKey}`, {
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

  if(!response.ok) {
      throw new Error(`Failed to update description for ${issueKey}: ${response.status}, ${response.statusText}`);
  }
  console.log(`Successfully updated description for ticket ${issueKey}`)
  return response.ok;
}