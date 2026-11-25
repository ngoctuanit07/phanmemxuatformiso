# JACKLABS V9.0 — Framework-aware Code Formatting Rules

## Goals
- Format code using **installed project-version-compatible** tools; never blindly upgrade framework/tool versions.
- Distinguish official framework/language style guides from marketplace quality requirements: **CodeCanyon/Codester do not supply a universal controller/model/JS/CSS formatter**.
- Formatting is not hardening: security, behavior, reliability, marketplace quality, tests and licensing require distinct verification.

## Safety and workflow
1. Read AGENTS.md, V8_RULES.md, V9_RULES.md, TASK_STATE.json and SESSION_HANDOFF.md if available.
2. Inspect manifest/lockfiles, repo status and existing formatter configuration. Use a project-defined formatter first.
3. Prefer changed files from Git; default FORMAT_CHECK with no mutation. FORMAT_APPLY only when explicitly asked.
4. Do not install dependencies, update lockfiles, change framework, alter database, reformat vendor/build/generated assets, or rewrite user code to force lint pass.
5. Check for existing uncommitted edits, report them, never reset or overwrite another agent's work.
6. Controller / model / routes PHP: Laravel Pint where installed; alternative project-defined PHP-CS-Fixer. Static review for auth/validation/business logic is separate.
7. Blade: only use formatter known compatible with installed tooling (e.g. a Pint with `--blade` support); skip and flag otherwise. Avoid generic HTML formatter on Blade.
8. JS/TS/CSS/SCSS/HTML/JSON: local Prettier or project-configured formatter. Respect .prettierignore, .editorconfig and framework conventions; do not format minified files.
9. WordPress PHP: WPCS PHPCS/PHPCBF only if project has installed/configured them. JS/CSS use project format tools.
10. Python: Ruff if installed/configured. Node/Nest: existing ESLint rules for diagnostics and configured fixes separately.
11. Before changes: require clean scope and check. After: review diff, rerun check, syntax/build/targeted regression tests and record evidence. Do not claim tests passed if not run.
12. Never call marketplace listing "approved" solely from formatter pass.
13. For Codex and Antigravity, the same `AGENTS.md` and `.agents/skills/` apply; actions require actual installed command tools.

## FORMAT_CHECK and FORMAT_APPLY
- FORMAT_CHECK: read-only; report missing tooling, style drift and affected file paths.
- FORMAT_APPLY: only explicit approved file set; run formatters; abort on errors; show diff; test; checkpoint. Never hide generated broad diffs.
- If formatter not available: report BLOCKED, no auto-download or fake PASS.

## Mandatory output
- Framework/tool version evidence; file scope; before/after changed files; check/apply commands; tests and unresolved findings; recommendation for marketplace readiness.
