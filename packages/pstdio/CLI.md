#### Init

config.json

```sh
{
  "project_id": "118795c0-4abd-46bc-8888-0e59589c4e1f"
}
```

- `pstdio projects create` - Create a new project and initialize it.
- `pstdio projects link --project-id <project-id>` - Given an existing project with project-id, write `.pstdio/config.json` at the current git root (repo root or current git worktree root). Also scaffold `.pstdio/docs/docs.json` and starter markdown (`.pstdio/docs/index.md`).

#### Docs

- `pstdio docs save` - Save `.pstdio/docs/navigation.json` and `**/*.md` to persisted project docs storage.
- `pstdio docs pull` - Pull persisted project docs back into local `.pstdio/docs` (requires local `.pstdio/config.json`).
