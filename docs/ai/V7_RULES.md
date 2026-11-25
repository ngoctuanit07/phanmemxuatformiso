# JACKLABS V7 — Marketplace-first engineering addendum

## Core promise and non-promise
Automate repeatable checks and evidence collection. Do not predict a reviewer verdict with certainty or invent rejection reasons.

## Evidence-first triage
- Before changes, obtain platform, category, exact item/rejection status, submission date, dashboard message, any email, submission ZIP hash, and current version.
- Separate hard/soft rejection, unavailable item, pending review, onboarding restriction and unknown status.
- A report of "no email" is not enough to diagnose a hard rejection; review dashboard and notification settings and consider official support.
- Never resubmit a hard rejected item as-is or advise disguising it as a new item.

## Marketplace gates
1. Author eligibility and category eligibility, based on current official sources.
2. Commercial differentiation (evidence of features/value unavailable in closely related competitors).
3. Clear value proposition and polished demo, not just a technical checklist.
4. Security: installer locked; route authorization; IDOR; CSRF; input validation; safe error output; credentials, license protections without trapping legitimate buyers.
5. Clean install on fresh environment and upgrade path; dependencies and version support.
6. License inventory for every third-party library, font, icon, image, and demo-only asset.
7. Package contains necessary source, English documentation, SQL/migrations/seed instructions, build and environment templates, but not .env, secrets, logs, cache, node_modules, .git, customer data or release credentials.
8. Category-specific preview, screenshots, icon dimensions and metadata from fresh official docs.
9. Supportability: beginner instructions, troubleshooting, demo access limitations, changelog and migration strategy.
10. Review readiness: record gates, evidence and unknowns. Critical blockers mean NO-GO.

## Workflow and token discipline
Read AGENTS.md, V6_RULES, V7_MODES and existing docs; reuse prior evidence where still current. Scope Graphify queries; don't dump graph.json. For third-party rules browse official sources; mark dates. Keep checkpoint in TASK_STATE.json and SESSION_HANDOFF.md without overwriting existing progress.
Do not use fabricated review emails, fake approvals, scraped competitor code, or claim that automation certifies CodeCanyon/Codester acceptance.
Do not publish, upload, or change live demos without explicit permission.
