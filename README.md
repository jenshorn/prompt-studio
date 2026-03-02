<p align="center">
  Prompt Studio (beta)
</p>
<p align="center">Prompt Studio helps you plan and delegate tasks to coding agents without losing control.</p>
<p align="center">
 <a href="https://www.npmjs.com/package/pstdio"><img alt="npm" src="https://img.shields.io/npm/v/pstdio?style=flat-square" /></a>
  <a href="https://github.com/pufflyai/schub/actions/workflows/test-and-build.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/pufflyai/schub/test-and-build.yml?style=flat-square" /></a>
</p>

**This project is WIP and not ready for general use**

## Installation

```bash
npm i -g pstdio@latest        # or bun/pnpm/yarn
```

## Quickstart

1. Start the dashboard: `pstdio`
2. Create a new project.
3. Select the local repository you want to work on.
4. Schub creates `.pstdio/config.json` for that repo.

We recommend adding `.pstdio/tickets` to `.gitignore` so local ticket files do not get committed.

### Commands

Run the CLI using `pstdio`.

```bash
pstdio [command]
```

#### Dashboard

- `pstdio dashboard` - Start the web dashboard (opens at `http://localhost:4173`).
