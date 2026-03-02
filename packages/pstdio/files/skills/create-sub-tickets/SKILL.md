---
name: create-sub-tickets
description: "Break a parent ticket into actionable sub-tickets. Use when asked to create child tickets under a ticket id."
---

## User Input (should contain parent ticket shorthand `TK####`)

```text
$ARGUMENTS
```

## Workflow

1. Identify the parent ticket shorthand (`TK####`) from the user request.
2. Load the parent ticket locally:
   - Run `npx schub tickets pull --id "<parent-ticket-id>"`.
3. Confirm `.schub/tickets/<parent-ticket-id>_<slug>/ticket.md` exists.
4. Read the parent ticket and derive sub-tickets. Each sub-ticket should be:
   - Small enough to implement in one sitting.
   - Independently testable.
   - Include `Implementation Notes` covering assumptions, key decisions, and where to look in code.
   - Include `Acceptance` criteria with explicit tests (file paths, cases covered) and exact commands to run.
   - Include corresponding documentation updates.
5. Create each sub-ticket via the CLI (one command per sub-ticket):
   - Run `npx schub tickets write --title "<ticket title>" --status "<status>" --parent-id "<parent-ticket-id>"`.
6. Fill each child ticket template with concrete details.
7. Verify every child ticket has `parent_id` set to the parent ticket id before saving.
8. When defining acceptance, list the exact test file paths, cases covered, and commands to run. Tests must live in the same ticket as the feature/bugfix work. Do not create standalone “add tests” tickets. Tests belong with the functional change they validate.
9. Resolve blockers by checking all existing tickets that are not done `npx schub tickets list open`. If another ticket is a blocker, add it to `depends_on` in frontmatter. If blocked, run `npx schub tickets update --id “<ticket-id>” --status blocked --blocked-reason <reason>`
10. Run `npx schub tickets save --id “<ticket-id>”` for each child ticket to persist updates.
11. Stop after the sub-ticket files are created. Do not implement code or modify plan artifacts.

## Output Locations

- Parent Ticket: `.schub/tickets/<parent-ticket-id>_<slug>/ticket.md`
- Sub-tickets: `.schub/tickets/<ticket-id>_<slug>/ticket.md`

## Ticket Notes

- Split sub-tickets that span multiple systems or large scopes.
- Record assumptions in Implementation Notes when key details are missing.
