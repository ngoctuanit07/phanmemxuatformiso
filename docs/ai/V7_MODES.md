# JACKLABS V7 — Marketplace submission modes

Modes preserve all V6 modes. Modes do not upload or send submissions.

| Mode | Action | Source mutations |
|---|---|---|
| REJECTION_TRIAGE | Determine status from verifiable evidence, account messages and rejection history | None |
| MARKETPLACE_AUDIT | Evaluate sellability: originality, competition, technical, legal, presentation, buyer experience | None |
| DIFFERENTIATION | Compare comparable items and document concrete differentiation before implementation | None |
| MARKETPLACE_REPAIR | Implement one scoped remediation with tests and checkpoints | Allowed only in scope |
| CLEAN_INSTALL_QA | Test install, configuration, update, rollback in isolated environment | No production mutations |
| PACKAGE_AUDIT | Inspect an existing release directory/ZIP for forbidden inclusions, missing docs and unsafe files | None |
| PRE_SUBMISSION | Combine results and issue evidence-based GO / NO-GO / CONDITIONAL | None |

Mandatory evidence: file paths, test command/results, source URL and date for marketplace statements, or UNKNOWN.
Precedence: existing AGENTS.md and V6 rules plus V7, then explicit user's scope. Security and production data safety always apply.
Marketplace approval is discretionary; never claim guaranteed approval. Hard rejection is not a license to resubmit identical items.
