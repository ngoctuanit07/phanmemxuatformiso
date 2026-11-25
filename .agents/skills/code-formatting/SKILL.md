---
name: code-formatting
description: Framework-aware, incremental code formatting for changed controllers, models, routes, Blade views, JS, CSS, and other source files using installed tools, with safe check/apply and regression gates.
---
# Code Formatting Skill — V9.0

1. Read AGENTS.md, docs/ai/V9_RULES.md, docs/engineering/FORMATTING_POLICY.md.
2. Detect framework version and local formatter configs, inspect `git status --short` and select only relevant changed files.
3. FORMAT_CHECK first. For Laravel use project Pint (`vendor/bin/pint`), for JS/CSS use local Prettier (`node_modules/.bin/prettier`). If installed tooling is unavailable, report unverified/blocker; never silently install.
4. On explicit FORMAT_APPLY use `scripts/format-project.ps1` from V9 distribution or invoke appropriate project-local tools with explicit file paths. If Blade is included, require compatible Blade formatter and HTML rendering checks.
5. Review diff, verify lint/test/build; flag security/business logic issues separately; update checkpoint.
6. Do not reformat entire vendor/public compiled assets or untouched modules.
