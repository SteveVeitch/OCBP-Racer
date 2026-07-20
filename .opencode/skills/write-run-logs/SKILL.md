---
name: write-run-logs
description: Use at the end of any opencode session or routine to write a structured run log to _bmad-output/routines/logs/. Captures tool calls, files changed, and narratives per subagent. Invoke with /write-run-logs [session-name].
---

# Write Run Logs

Generate a structured markdown log of the current session, broken down by agent/subagent.

## Invocation

```
/write-run-logs [optional-session-name]
```

- If `[optional-session-name]` is provided, use it as the filename prefix
- If omitted, use "run" as the default name

## Output

Write to: `_bmad-output/routines/logs/[NAME]-[DATE].md`
- `[NAME]` = session name from arguments (or "run")
- `[DATE]` = today's date in YYYY-MM-DD format

## Log Format

Generate the file using this exact structure:

```markdown
# Run: [Session Title] — [YYYY-MM-DD]

## Summary
[2-3 sentence overview of what was accomplished this session]

## Agents

### [agent-icon] [agent-name] ([mode])
**Tools used:** [Tool] ([count]×), [Tool] ([count]×)...
**Files changed:** `path/to/file1.ts`, `path/to/file2.ts`
**Commands run:** `npm test`, `npx vite build`...

#### Actions
- [Bullet list of concrete actions taken: edits, file reads, searches, builds, etc.]

#### Narrative
[2-4 sentence explanation of what this agent did and why. Focus on decisions and outcomes, not tool mechanics.]

## Test Results
[If tests were run: ✅ X passed, Y failed, Z total. If no tests: "No tests run this session."]

## Commits
[If commits were made: list with short hash + message. If none: "No commits this session."]

## Notes
[Optional: any blockers, deferrals, or follow-ups to remember]
```

## Instructions

When invoked, follow these steps:

1. **Review the session** — look through the entire conversation history to identify:
   - Every agent/subagent that was invoked (via Task tool or built-in agents)
   - What each agent did (tool calls, decisions, outcomes)
   - Files that were created, edited, or deleted
   - Bash commands that were run (builds, tests, git operations)
   - Test results (pass/fail counts)
   - Git commits (hashes and messages)

2. **Group by agent** — organize all activity under the agent that performed it:
   - Primary agent (build): the main conversation agent
   - Subagents (explore, general, etc.): each Task-spawned agent gets its own section
   - Use appropriate icons: 🔧 for build, 🔍 for explore, 🌐 for general, 📋 for plan

3. **Write narratives** — for each agent, write a brief summary of what it accomplished and why. Focus on outcomes and decisions, not step-by-step tool mechanics.

4. **Generate the file** — write the complete markdown to `_bmad-output/routines/logs/[NAME]-[DATE].md`

5. **Confirm** — tell the user where the file was written and how many agents/commits are logged.

## Edge Cases

- If the session has no subagents, just document the primary agent's work
- If no tests were run, skip the Test Results section or note "No tests run"
- If no commits were made, skip the Commits section or note "No commits"
- If the output directory doesn't exist, create it (`_bmad-output/routines/logs/`)
- If a file with the same name already exists, append a suffix: `[NAME]-[DATE]-2.md`, `-3.md`, etc.
