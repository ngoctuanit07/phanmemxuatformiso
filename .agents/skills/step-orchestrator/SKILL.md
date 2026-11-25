---
name: step-orchestrator
description: Resume the exact current development task or execute only the next uncompleted step using verified task checkpoints, Git state, scoped Graphify discovery and targeted tests.
---
# Step Orchestrator V8

Use this skill whenever the developer says "continue step", "resume", "tiếp tục", "next step" or asks to prevent repeat work across Antigravity sessions.

Read AGENTS.md, V8_MODES, RESUME_PROTOCOL and only relevant parts of Task State and Session Handoff. Compare Git and code; select the next unblocked step of named task. Graphify update only if stale, query tightly, avoid source dump. For NEXT_STEP perform exactly one step; for RESUME do not leave current task. Test and checkpoint. If blocked state uncertain, report rather than guess. Keep a terse completion report.
