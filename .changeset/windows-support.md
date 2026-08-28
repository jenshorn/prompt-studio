---
"pstdio": patch
"@pstdio/sdk": patch
---

Add Windows support for the local-checkout CLI.

- Install `pstdio`/`pst` `.cmd` wrappers (beside Bun when it's the only writable
  PATH entry) and run the source CLI with `--conditions=source`.
- Resolve npm `.cmd`/`.bat` shims through `cmd.exe /c call`, switch a `.ps1`
  shim to its sibling `.cmd`/`.exe` (or `powershell -File`), prefer native
  executables for `git` and Codex, and hide spawned console windows.
- Run worktree setup scripts through a POSIX shell when one is on PATH,
  falling back to `cmd.exe` only when it isn't.
- Copy extension files into the runtime cache on Windows instead of symlinking
  them (unprivileged Windows can't create file symlinks), so default extensions
  load and coding agents are detected.
