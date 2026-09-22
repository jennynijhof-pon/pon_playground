# Playwright auth setup

This project uses a Playwright setup test to log in once and reuse that login for the other tests.

Without this setup, every test would need to go through the full login flow. That would make the test run slower and more fragile, especially because the login uses TOTP. Instead, Playwright saves the browser session after login and loads it again for the real tests.

## Important files

| File | What it does |
| --- | --- |
| `src/auth/auth.setup.ts` | Logs in and saves the authenticated browser session. |
| `src/auth/.auth/user.json` | Stores the saved login session. This is the file Playwright reuses. |
| `playwright.config.ts` | Tells Playwright to run the auth setup before the tests and to use the saved session. |
| `src/utils/tdgConfig.ts` | Contains the Test Data Generator URL and reads the username/password from environment variables. |
| `.env` | Should contain the tester-specific login credentials. |

## Required environment variables

The login flow reads credentials from environment variables:

```text
JIRA_USERNAME=your-username
TDG_PASSWORD=your-password
```

These values are loaded from the `.env` file in the project root.

Do not commit real usernames, passwords, tokens, or generated auth files to Git.

## How the auth setup works

When you run the tests, Playwright first runs the `setup` project from `playwright.config.ts`.

The setup project runs this file:

```text
src/auth/auth.setup.ts
```

That setup does the following:

1. It checks whether there is already a saved auth file at `src/auth/.auth/user.json`.
2. If the file exists, it opens a new browser context using that saved session.
3. It goes to the Test Data Generator page.
4. It checks whether the authenticated page is visible by looking for the `Search orders` button.
5. If the button is visible, the saved login is still valid and the setup stops there.
6. If the auth file is missing, expired, unreadable, or no longer opens the authenticated page, the setup runs the full login flow again.

This means the full login cycle only runs when it is actually needed. Unfortunately the whole login could not be automated yet and when the screen opens on the TOTP code you have to add this manually. 

## What happens during a full login

If the saved auth is not valid, the setup:

1. Opens the Test Data Generator URL from `tdgConfig.baseUrl`.
2. Waits for the login page.
3. Fills in the username from `JIRA_USERNAME`.
4. Fills in the password from `TDG_PASSWORD`.
5. Clicks the login button.
6. Clicks `TOTP LOGIN`.
7. You manually add the generated code from your authenticator.
8. Waits until the application is loaded.
9. Saves the browser session to `src/auth/.auth/user.json`.

After this, the other tests can reuse the saved session and do not need to log in themselves.

## How the normal tests use auth

In `playwright.config.ts`, the `chromium` project depends on the `setup` project:

That means Playwright always runs the auth setup before running the normal test specs. The normal tests then use this saved storage state:

```text
storageState: STORAGE_STATE
```

`STORAGE_STATE` points to:

```text
src/auth/.auth/user.json
```

So every normal test starts with the same logged-in browser session.

## When the auth file is refreshed

The auth file is refreshed when:

- `src/auth/.auth/user.json` does not exist.
- The saved session has expired.
- The saved session is no longer accepted by the application.
- The file cannot be read as a valid Playwright storage state.

In those cases, the setup automatically logs in again and overwrites the old auth file with a fresh one.

## Running the tests

Run all tests with:

```bash
pnpm test
```

Run only the auth setup with:

```bash
pnpm exec playwright test --project=setup
```

This is useful when you want to refresh or check the saved login before running the full test suite.

## Troubleshooting

If tests fail because they are not logged in:

1. Check that `.env` contains `JIRA_USERNAME` and `TDG_PASSWORD`.
2. Delete `src/auth/.auth/user.json`.
3. Run `pnpm exec playwright test --project=setup`.
4. Run the normal tests again.

If the setup reaches the TOTP step, the tester may need to complete the expected login approval flow before the app session can be saved.
