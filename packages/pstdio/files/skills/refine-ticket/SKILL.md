---
name: refine-ticket
description: "Refine an existing ticket into the a ticket template. Use when asked to refine, improve, expand, or structure an existing ticket."
---

## User Input

```text
$ARGUMENTS
```

## Workflow

1. Identify the target ticket shorthand from the user request (`TK####`).
   - If the request includes a template name (e.g. `refine ticket: TK0001 with template proposal-template`), extract the template slug.
2. Run `npx schub tickets apply-template --id "<ticket-shorthand>"` (or `npx schub tickets apply-template --id "<ticket-shorthand>" --template "<slug>"` when a template is specified).
   - This command pulls the ticket from DB if it is not local.
   - It creates `ticket.original.md` in the ticket folder as a backup.
   - It prepends the ticket template into `ticket.md`.
   - The `--template` value is a lowercase slug matching the template name in the DB (e.g. `ticket`, `proposal`).
   - It wraps the original ticket content in:
     - `<MOVE_TO_TEMPLATE>`
     - `</MOVE_TO_TEMPLATE>`
3. Refine `ticket.md` by moving and rewriting information from `<MOVE_TO_TEMPLATE>...</MOVE_TO_TEMPLATE>` into the template sections.
4. Add missing detail using repo/docs research so the ticket is implementation-ready:
   - Priority, complexity, parallelizable
   - Goal, references, scope, implementation notes
   - Steps aligned to Red/Green/Refactor
   - Acceptance criteria with explicit pass/fail conditions
   - Evidence expectations and exact validation commands
5. Remove `<MOVE_TO_TEMPLATE>...</MOVE_TO_TEMPLATE>` once the template is fully populated.
6. Save to DB with `npx schub tickets save --id "<ticket-shorthand>"`.
7. Stop after refinement and save. Do not implement code changes unless explicitly asked.

## Output Locations

- Ticket: `.schub/tickets/<ticket-id>_<slug>/ticket.md`
- Original backup: `.schub/tickets/<ticket-id>_<slug>/ticket.original.md`
