---
name: context-budget
description: Reduce unnecessary AI context and tokens by scoping Graphify queries, limiting file reads, output lengths, and reusing verified repository checkpoints.
---
# Context Budget Guard

No promise of zero tokens. Prefer local `graphify . --code-only` for first build when no LLM key. Reuse the existing graph, update only after code changes, query the smallest relevant scope. Avoid pasting `graph.json`, huge logs, generated files or previous full audits into context. Read source truth only for affected routes/controllers/models and tests. Constrain command output (e.g. git diff --stat, targeted git diff) without omitting crucial failures. Capture token usage only when tool/platform provides credible metrics, otherwise mark UNKNOWN.
