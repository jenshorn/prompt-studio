---
name: review-ticket
description: "Run a review session for a ticket by creating a list of open questions, updating the ticket, adding a Q&A section, and deleting REVIEW_ME.md on completion. Use when asked to review tickets."
---

## User Input (ticket-id shorthand `TK####`)

```text
$ARGUMENTS
```

## Workflow

1. Pull the ticket locally if not already present:
   - Run `npx pstdio tickets pull --id "<ticket-id>"`.
2. Confirm `.pstdio/tickets/<ticket-id>_<slug>/ticket.md` exists. If it is missing, ask the user to run the create-ticket skill first. If it is still a draft, ask the user to review it first.
3. Review the ticket by checking the [MISSING INFORMATION] tags and the potential issues listed.
4. If there are issues, or missing information, run `npx pstdio templates create --name "review" --ticket-id "<ticket-id>"` to scaffold `REVIEW_ME.md` in the ticket folder.
5. Triage each item:
   - **High-stakes** (scope, risks, dependencies, security, performance): create a bullet point item in the review checklist.
   - **Minute details** (naming, copy, formatting, low-impact defaults): make a decision update the ticket and mark as an assumption.
6. Once the review checklist is completed, gather unchecked items (`- [ ]`) in order.
7. Start the review loop (process unchecked items in order), ask each item as a question. If unclear, ask a quick follow-up and do not advance.
   - Update the review checklist accordingly inline with the answers.
8. When no unchecked items remain, update the ticket with the new information.
9. When no unchecked items remain, run `npx pstdio review complete --ticket-id "<ticket-id>"` to create `Q&A.md` in the ticket folder.
   - Ask the LLM to migrate the TODO block into the Q&A sections and remove the TODO block.
10. Mark the ticket Status as "Accepted".

## Output Locations

- Ticket: `.pstdio/tickets/<ticket-id>_<slug>/ticket.md`
- (OPTIONAL) Review In Progress: `.pstdio/tickets/<ticket-id>_<slug>/REVIEW_ME.md`
- (OPTIONAL) Review Completed: `.pstdio/tickets/<ticket-id>_<slug>/Q&A.md`

## Notes

- Avoid expanding scope beyond missing information in the ticket.
- Focus review on high-stakes issues; place details into assumptions instead of asking.
- **Do not start the implementation** only edit the ticket folder.
