---
name: task-continuity
description: Resume interrupted repository work from saved task state and git evidence without re-reading the whole codebase; create accurate handoffs.
---

# Task Continuity & Context Recovery

1. Read `AGENTS.md`, `docs/ai/TASK_STATE.json`, and `docs/ai/SESSION_HANDOFF.md` if they exist.
2. Verify branch, git status, relevant diff, task-specific files and latest recorded test results. Never treat notes alone as proof.
3. Identify the active task and next smallest safe step. If user requests different work, prioritize the new request.
4. Use Graphify scoped queries only when dependencies/architecture need discovery.
5. Execute the step; save a checkpoint after a meaningful milestone.
6. Update task state atomically where possible; preserve other tasks. Keep valid JSON.
7. Update handoff with: task ID, what was verified, changed files, test status, blocker, and next action.
8. On resume after crash/compaction, re-check reality, do not blindly rerun destructive or costly commands.

States: todo, in_progress, blocked, review, done. Do not mark `done` without acceptance/verification evidence.
