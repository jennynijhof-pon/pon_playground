# pon_playground

This project is set up to use pnpm, Playwright and TypeScript.

Quick start

1. Initialize the project and install dependencies:

```bash
pnpm init -y
pnpm add -D @playwright/test playwright typescript ts-node
```

2. Install Playwright browsers:

```bash
pnpm exec playwright install
```

3. Run tests:

```bash
pnpm test
```

4. Type-check:

```bash
pnpm run typecheck
```

Files created

- [package.json](package.json)
- [tsconfig.json](tsconfig.json)
- [playwright.config.ts](playwright.config.ts)
- [tests/example.spec.ts](tests/example.spec.ts)
- [.gitignore](.gitignore)
- [README.md](README.md)